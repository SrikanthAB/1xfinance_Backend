import bcryptjs from 'bcryptjs'
import mongoose, { Schema } from "mongoose";
import { USER_STATUS } from "../utils/constants";
import { GENDER } from "../utils/constants";
import { validatePassword } from "../validations/global";
import { validateEmail } from "../validations/global";
import { IAdmin } from '../interfaces/admin';

const adminSchema = new Schema<IAdmin>(
  {

    avatar: {
      type: String,
      default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'please enter email address'],
      unique: true,
      trim: true,
      lowercase: true,
      validate:validateEmail,
    },
    password: {
      type: String,
      required: [true, 'please enter password'],
      trim: true,
      minlength: 8,
      validate:validatePassword,
      private: true,
    },
    contactNumber: {
      type: Number,
      trim: true,
    },
    gender: {
      type: String,
      enum: [GENDER.MALE, GENDER.FEMALE, GENDER.OTHERS],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [USER_STATUS.ACTIVE, USER_STATUS.BLOCK, USER_STATUS.INACTIVE],
      default: USER_STATUS.ACTIVE,
    },
    plan: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
      },
      paidAmount: {
        type: Number,
      },
      remainingAmount: {
        type: Number,
      },
      comment: {
        type: String,
        trim: true,
      },
      planExpiry: {
        type: Date,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
    walletAddress: {
      type: String,
      required: false,
      trim: true,
      default: null,
      index: true,
      sparse: true,
      validate: {
        validator: function(value: string | null) {
          // Basic Ethereum address validation
          return value === null || /^0x[a-fA-F0-9]{40}$/.test(value);
        },
        message: 'Invalid wallet address format'
      }
    },
    planHistory: [
      {
        plan: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Plan',
        },
        paidAmount: {
          type: Number,
        },
        remainingAmount: {
          type: Number,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        comment: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);


// Add a method to check if password matches
adminSchema.methods.isPasswordMatch = async function (password: string): Promise<boolean> {
  const admin = this;
  return bcryptjs.compare(password, admin.password);
};

// Encrypt password before saving
adminSchema.pre('save', async function (next) {
  const admin = this;
  if (admin.isModified('password')) {
    admin.password = await bcryptjs.hash(admin.password, 8);
  }
  next();
});

// Create and export the model
const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;
