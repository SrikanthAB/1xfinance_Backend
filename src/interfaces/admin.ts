import mongoose, { Document } from "mongoose";
import { Gender, USER_STATUS } from "../utils/constants";

/**
 * Represents an admin user in the system
 */
export interface IAdmin extends Document {
  /** IP address of the admin's last login */
  ipAddress?: string | null;
  
  /** URL to the admin's avatar image */
  avatar: string;
  
  /** Full name of the admin */
  fullName: string;
  
  /** Unique email address */
  email: string;
  
  /** Hashed password */
  password: string;
  
  /** Physical address */
  address?: string;
  
  /** Contact phone number */
  contactNumber: number;
  
  /** Gender of the admin */
  gender: Gender;
  
  /** Role of the admin (e.g., 'Admin', 'SuperAdmin') */
  role: string;
  
  /** List of project IDs the admin has access to */
  projects: mongoose.Types.ObjectId[];
  
  /** Whether the email has been verified */
  isEmailVerified: boolean;
  
  /** Current status of the admin account */
  status: typeof USER_STATUS[keyof typeof USER_STATUS];
  
  /** Blockchain wallet address */
  walletAddress?: string;
  
  /** List of employee IDs managed by this admin */
  employees: mongoose.Types.ObjectId[];
  
  /** Current subscription plan details */
  plan: {
    /** Reference to the plan document */
    planId: mongoose.Types.ObjectId;
    
    /** Amount paid for the current billing cycle */
    paidAmount: number;
    remainingAmount: number;
    comment?: string;
    planExpiry?: Date;
    date: Date;
  };
  planHistory: Array<{
    plan: mongoose.Types.ObjectId;
    paidAmount: number;
    remainingAmount: number;
    date: Date;
    comment?: string;
  }>;
  createdBy: mongoose.Types.ObjectId;
  isPasswordMatch(password: string): Promise<boolean>;
}