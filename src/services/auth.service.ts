import jwt from "jsonwebtoken";
import { User, IUser } from "../models/user.model";
import { sanitizeAadhaar, isValidAadhaar, extractLast4Aadhaar } from "../validators/aadhaar";

export interface RegisterInput {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface LoginInput {
  emailOrPhone: string;
  password: string;
}

export interface AuthResult {
  user: Pick<IUser, "id" | "fullName" | "email" | "phoneNumber">;
  token: string;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dob?: Date;
  address?: string;
  kycStatus?: "pending" | "verified" | "rejected";
  aadhaarMasked?: string; // XXXXXXXX1234 when available
  aadhaarVerifiedAt?: Date;
}

export interface UpdateUserInput {
  fullName?: string;
  dob?: Date;
  address?: string;
  kycStatus?: "pending" | "verified" | "rejected";
  // Client may send full 12-digit Aadhaar; we only store last 4
  aadhaarNumber?: string;
}

export interface VerifyOtpInput {
  aadhaarNumber: string;
  otp: string;
}

function toPublicUser(user: IUser) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };
}

function toPublicUserFull(user: IUser): PublicUser {
  const last4 = user.aadhaarLast4;
  const aadhaarMasked = last4 ? `XXXXXXXX${last4}` : undefined;
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    dob: user.dob,
    address: user.address,
    kycStatus: user.kycStatus,
    aadhaarMasked,
    aadhaarVerifiedAt: user.aadhaarVerifiedAt,
  };
}

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await User.findOne({
      $or: [
        { email: input.email.toLowerCase() },
        { phoneNumber: input.phoneNumber },
      ],
    });
    if (existing) {
      throw new Error("User already exists with email or phone");
    }

    const user = await User.create({
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      email: input.email.toLowerCase(),
      passwordHash: input.password,
    });

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET as string   , {
      expiresIn: "7d",
    });

    return { user: toPublicUser(user), token };
  }

  static async login(input: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({
      $or: [
        { email: input.emailOrPhone.toLowerCase() },
        { phoneNumber: input.emailOrPhone },
      ],
    });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const ok = await user.comparePassword(input.password);
    if (!ok) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
    return { user: toPublicUser(user), token };
  }

  static async getUserById(id: string): Promise<PublicUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return toPublicUserFull(user);
  }

  static async updateUser(id: string, input: UpdateUserInput): Promise<PublicUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    if (typeof input.fullName === "string" && input.fullName.trim() !== "") {
      user.fullName = input.fullName.trim();
    }
    if (typeof input.address === "string") {
      user.address = input.address;
    }
    if (input.dob instanceof Date && !Number.isNaN(input.dob.getTime())) {
      user.dob = input.dob;
    }
    if (input.kycStatus) {
      user.kycStatus = input.kycStatus;
    }

    // Aadhaar number should only be persisted after successful OTP verification.

    await user.save();
    return toPublicUserFull(user);
  }

  // KYC OTP verification rules:
  // - If otp === "123456": set kycStatus = "verified", reset attempts to 0
  // - Else: increment attempts; if attempts >= 5 set kycStatus = "rejected"
  static async verifyKycOtp(id: string, input: VerifyOtpInput): Promise<PublicUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    

    const otp = (input.otp || "").trim();
    if(!otp){
      throw new Error("OTP is required");
    }
    if(!input.aadhaarNumber){
      throw new Error("Aadhaar number is required");
    }
    if (otp === "123456") {
      // If an Aadhaar number is provided alongside OTP, validate and persist last 4 now
      if (input.aadhaarNumber) {
        const sanitized = sanitizeAadhaar(input.aadhaarNumber);
        if (!isValidAadhaar(sanitized)) {
          throw new Error("Invalid Aadhaar number format");
        }
        user.aadhaarLast4 = extractLast4Aadhaar(sanitized);
      }
      user.kycStatus = "verified";
      user.kycOtpAttempts = 0;
      user.aadhaarVerifiedAt = new Date();
    } else {
      const current = user.kycOtpAttempts || 0;
      const next = current + 1;
      user.kycOtpAttempts = next;
      if (next >= 5) {
        user.kycStatus = "rejected";
      } else if (!user.kycStatus || user.kycStatus === "pending") {
        user.kycStatus = "pending";
      }
    }

    await user.save();
    return toPublicUserFull(user);
  }
}

export default AuthService;

