import jwt from "jsonwebtoken";
import { User, IUser } from "../models/user.model";
import { sanitizeAadhaar, isValidAadhaar, extractLast4Aadhaar } from "../validators/aadhaar";
import EmailService from "./email.service";

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
  emailVerified?: boolean;
  emailVerifiedAt?: Date;
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

export interface EmailOtpInput {
  email: string;
  otp: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface VerifyPasswordResetInput {
  email: string;
  otp: string;
}

export interface ResetPasswordInput {
  email: string;
  token: string;
  newPassword: string;
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
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
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

  /**
   * Send email OTP for email verification
   */
  static async sendEmailOTP(email: string): Promise<{ success: boolean; message: string; otp?: string }> {
    try {
      // Check if user exists with this email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return { success: false, message: 'No user found with this email address' };
      }

      // Check if email is already verified
      if (user.emailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Send OTP via email service
      const result = await EmailService.sendOTP(email);
      return result;

    } catch (error: any) {
      console.error('Send email OTP error:', error);
      return { success: false, message: 'Failed to send email OTP. Please try again.' };
    }
  }

  /**
   * Verify email OTP
   */
  static async verifyEmailOTP(email: string, otp: string): Promise<{ success: boolean; message: string; user?: PublicUser }> {
    try {
      // Check if user exists with this email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return { success: false, message: 'No user found with this email address' };
      }

      // Check if email is already verified
      if (user.emailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Verify OTP via email service
      const result = await EmailService.verifyOTP(email, otp);
      
      if (result.success) {
        // Update user's email verification status
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        await user.save();
        
        return {
          success: true,
          message: 'Email verified successfully!',
          user: toPublicUserFull(user)
        };
      }

      return result;

    } catch (error: any) {
      console.error('Verify email OTP error:', error);
      return { success: false, message: 'Failed to verify email OTP. Please try again.' };
    }
  }

  /**
   * Resend email OTP (wrapper around sendEmailOTP)
   */
  static async resendEmailOTP(email: string): Promise<{ success: boolean; message: string; otp?: string }> {
    return this.sendEmailOTP(email);
  }

  /**
   * Send password reset OTP
   */
  static async forgotPassword(input: ForgotPasswordInput): Promise<{ success: boolean; message: string; otp?: string }> {
    try {
      // Check if user exists with this email
      const user = await User.findOne({ email: input.email.toLowerCase() });
      if (!user) {
        return { success: false, message: 'No user found with this email address' };
      }

      // Send password reset OTP via email service
      const result = await EmailService.sendPasswordResetOTP(input.email);
      return result;

    } catch (error: any) {
      console.error('Forgot password error:', error);
      return { success: false, message: 'Failed to send password reset OTP. Please try again.' };
    }
  }

  /**
   * Verify password reset OTP
   */
  static async verifyPasswordResetOTP(input: VerifyPasswordResetInput): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      // Check if user exists with this email
      const user = await User.findOne({ email: input.email.toLowerCase() });
      if (!user) {
        return { success: false, message: 'No user found with this email address' };
      }

      // Verify password reset OTP via email service
      const result = await EmailService.verifyPasswordResetOTP(input.email, input.otp);
      
      if (result.success) {
        // Store the reset token in user document for additional security
        user.passwordResetToken = result.token;
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
      }

      return result;

    } catch (error: any) {
      console.error('Verify password reset OTP error:', error);
      return { success: false, message: 'Failed to verify password reset OTP. Please try again.' };
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(input: ResetPasswordInput): Promise<{ success: boolean; message: string; user?: PublicUser }> {
    try {
      // Check if user exists with this email
      const user = await User.findOne({ email: input.email.toLowerCase() });
      if (!user) {
        return { success: false, message: 'No user found with this email address' };
      }

      // Check if reset token exists and is valid
      if (!user.passwordResetToken || !user.passwordResetExpires) {
        return { success: false, message: 'No valid password reset request found. Please request a new password reset.' };
      }

      // Check if token has expired
      if (user.passwordResetExpires < new Date()) {
        // Clear expired reset data
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        return { success: false, message: 'Password reset token has expired. Please request a new password reset.' };
      }

      // Verify the reset token
      if (user.passwordResetToken !== input.token) {
        return { success: false, message: 'Invalid password reset token.' };
      }

      // Validate new password
      if (!input.newPassword || input.newPassword.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
      }

      // Update password
      user.passwordHash = input.newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return {
        success: true,
        message: 'Password reset successfully! You can now login with your new password.',
        user: toPublicUserFull(user)
      };

    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Failed to reset password. Please try again.' };
    }
  }

  /**
   * Resend password reset OTP (wrapper around forgotPassword)
   */
  static async resendPasswordResetOTP(email: string): Promise<{ success: boolean; message: string; otp?: string }> {
    return this.forgotPassword({ email });
  }
}

export default AuthService;

