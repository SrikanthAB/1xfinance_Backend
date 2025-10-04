
import { Schema, model, Document, Types } from 'mongoose';
import {
  ADMIN_APPROVAL_STATUS,
  AdminApprovalStatus,
} from '../../config/constants/global';
import bcryptjs from 'bcryptjs';

// Define interface for the KYC request document
export interface IUserKYC extends Document {
  userId: Types.ObjectId;
  isMobileVerified: boolean;
  isEmailVerified: boolean;
  isNationalIdVerified: boolean;
  adminApprovalStatus: AdminApprovalStatus;
  rejectionReason?: string | null;
  created_at: Date;
  _id: Schema.Types.ObjectId;
  refId:number;
}

// KYC Request Schema
const UserKYCSchema = new Schema<IUserKYC>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isNationalIdVerified: {
      type: Boolean,
      default: false,
    },
    adminApprovalStatus: {
      type: String,
      enum: Object.values(ADMIN_APPROVAL_STATUS),
      default: ADMIN_APPROVAL_STATUS.PENDING,
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
    refId:{
      type:Number,
      default:null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }, 
    versionKey: false, // Disable the __v field
  }
);


// Export the KYCRequest model
const UserKYC = model<IUserKYC>('UserKYC', UserKYCSchema);
export default UserKYC;
