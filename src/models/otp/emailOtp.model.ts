
import { Schema, model, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';
import {  OTP_EXPIRATION_TIME_MS } from '../../config/constants/global';
import { EMAIL_REGEX } from '../../utils/regex';

interface IEmailOTP extends Document {
  userId: Schema.Types.ObjectId;
  email: string;
  otpCode: string;
  attempts: number;
  expiresAt: Date;
  compareOTP(inputOtp: string): Promise<boolean>;
  _id: Schema.Types.ObjectId;
}

const EmailOTPSchema = new Schema<IEmailOTP>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
      match: EMAIL_REGEX,
      trim: true,
    },
    otpCode: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: OTP_EXPIRATION_TIME_MS / 1000 },
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
    versionKey: false,
  }
);

EmailOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: OTP_EXPIRATION_TIME_MS });
EmailOTPSchema.index({ email: 1 });
EmailOTPSchema.index({ userId: 1 });

EmailOTPSchema.pre('save', async function (next) {
  const emailOTP = this as IEmailOTP;

  if (emailOTP.isModified('otpCode')) {
    const salt = await bcryptjs.genSalt(10);
    emailOTP.otpCode = await bcryptjs.hash(emailOTP.otpCode, salt);
  }
  next();
});

EmailOTPSchema.methods.compareOTP = async function (inputOtp: string) {
  const emailOTP = this as IEmailOTP;
  return bcryptjs.compare(inputOtp, emailOTP.otpCode);
};

export const EmailOTP = model<IEmailOTP>('EmailOTP', EmailOTPSchema);

export default EmailOTP;
