import { IUserDocument } from '../models/user/user.model';
import { Schema } from 'mongoose';
// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      userDetails?: IUserDocument | null;
      user?: any;
    }
  }
}

// Custom Request type for authenticated routes
export interface AuthenticatedRequest extends Request {
  user: any; // Note: not optional here
  userDetails?: IUserDocument;
}

// Export other types
export type IOtpStatus = 'Pending' | 'Verified' | 'Failed';

export {}; 