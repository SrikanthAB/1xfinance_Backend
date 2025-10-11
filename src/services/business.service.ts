import jwt from "jsonwebtoken";
import { User, IUser } from "../models/user.model";
import { sanitizeAadhaar, isValidAadhaar, extractLast4Aadhaar } from "../validators/aadhaar";
import BusinessMail from "../models/business.auth.model";

export interface WishlistInput {

  email: string;
}

export interface WishlistResult {
  message: string;
  email: string;
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

export class BusinessService {
  static async addToWishlist(input: WishlistInput): Promise<WishlistResult> {
    const existing = await BusinessMail.findOne({
      email: input.email.toLowerCase(),
    });
    
    if (existing) {
      throw new Error("Email already exists in wishlist");
    }

    await BusinessMail.create({
      
      email: input.email.toLowerCase(),
    });

    return { 
      message: "Successfully added to wishlist", 
      email: input.email 
    };
  }

 
}

export default BusinessService;

