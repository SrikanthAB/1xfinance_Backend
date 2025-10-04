import { Document } from 'mongoose';
export interface UserDocument extends Document {
  email: string;
  password: string;
  fullName?: string;
  role?: string;
  isPasswordMatch(password: string): Promise<boolean>;
} 