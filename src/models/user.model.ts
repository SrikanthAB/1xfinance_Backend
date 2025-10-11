import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  fullName: string;
  phoneNumber: string;
  email: string;
  passwordHash: string;
  // KYC-related optional fields
  dob?: Date;
  address?: string;
  kycStatus?: "pending" | "verified" | "rejected";
  aadhaarLast4?: string; // only store last 4 digits
  kycOtpAttempts?: number; // count of failed OTP attempts
  aadhaarVerifiedAt?: Date; // timestamp when Aadhaar/KYC was verified
  // Email verification fields
  emailVerified?: boolean;
  emailVerifiedAt?: Date;
  // Password reset fields
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
  
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    // Optional KYC fields
    dob: { type: Date, required: false },
    address: { type: String, required: false, trim: true },
    kycStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    aadhaarLast4: { type: String, required: false, minlength: 4, maxlength: 4 },
    kycOtpAttempts: { type: Number, required: false, default: 0, min: 0 },
    aadhaarVerifiedAt: { type: Date, required: false },
    // Email verification fields
    emailVerified: { type: Boolean, required: false, default: false },
    emailVerifiedAt: { type: Date, required: false },
    // Password reset fields
    passwordResetToken: { type: String, required: false },
    passwordResetExpires: { type: Date, required: false },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (
  this: IUser,
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

UserSchema.pre("save", async function (next) {
  const doc = this as IUser;
  if (!doc.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(10);
  doc.passwordHash = await bcrypt.hash(doc.passwordHash, salt);
  next();
});

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;

