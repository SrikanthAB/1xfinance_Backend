import mongoose, { Document } from "mongoose";
import { GENDER, USER_STATUS } from "../utils/constants";

export interface ISuperAdmin extends Document {
  ipAddress: string | null;
  avatar: string;
  fullName: string;
  email: string;
  password: string;
  contactNumber: number;
  gender: typeof GENDER[keyof typeof GENDER];
  role: string;
  plans: mongoose.Types.ObjectId[];
  status: typeof USER_STATUS[keyof typeof USER_STATUS];
  otp?: number;
  otpExpiry?: Date;
  isPasswordMatch(password: string): Promise<boolean>;
  verifyOTP(): number;
  id:string;
  username: string;
}
