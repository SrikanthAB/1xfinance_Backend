import bcryptjs from 'bcryptjs';
import mongoose, { Schema, Document, Model } from 'mongoose';
import { USER_STATUS, GENDER } from '../utils/constants';
import { validatePassword, validateEmail } from '../validations/global';
import { ISuperAdmin } from '../interfaces/superAdmin';
import { customPlugin } from './plugins/customPlugin';

// Create schema with TypeScript type annotations
const superAdminSchema: Schema<ISuperAdmin> = new Schema(
  {
    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },
    avatar: {
      type: String,
      default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    fullName: {
      type: String,
      required: [true, 'Please enter full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter email address'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: validateEmail,
    },
    password: {
      type: String,
      required: [true, 'Please enter password'],
      trim: true,
      minlength: 8,
      private: true, // For hiding in responses (handled in a transformer or manually)
      validate: validatePassword,
    },
    contactNumber: {
      type: Number,
      trim: true,
      required: [true, 'Please enter a mobile number'],
      match: [/^[1-9][0-9]{9}$/, 'The value is not a valid mobile number.'],
    },
    gender: {
      type: String,
      required: [true, 'Please select the gender'],
      enum: [GENDER.MALE, GENDER.FEMALE, GENDER.OTHERS],
    },
    role: {
      type: String,
      default: 'admin',
    },
    plans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
      },
    ],
    status: {
      type: String,
      enum: [USER_STATUS.ACTIVE, USER_STATUS.BLOCK, USER_STATUS.INACTIVE],
      default: USER_STATUS.ACTIVE,
    },
    otp: {
      type: Number,
      trim: true,
    },
    otpExpiry: {
      type: Date,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


superAdminSchema.plugin(
  customPlugin({
    hideFields: ['password', 'otp', 'otpExpiry'], // Fields to hide
    renameFields: [], // Optionally pass renaming fields in "from:to" format
  })
);
// Add instance methods
superAdminSchema.methods.isPasswordMatch = async function (
  password: string
): Promise<boolean> {
  return bcryptjs.compare(password, this.password);
};

superAdminSchema.methods.verifyOTP = function (): number {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  this.otp = otp;
  this.otpExpiry = otpExpiry;
  return otp;
};

// Hash password before saving
superAdminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcryptjs.hash(this.password, 8);
  }
  next();
});

// Define and export model
const SuperAdmin: Model<ISuperAdmin> = mongoose.model<ISuperAdmin>(
  'SuperAdmin',
  superAdminSchema
);

export default SuperAdmin;
