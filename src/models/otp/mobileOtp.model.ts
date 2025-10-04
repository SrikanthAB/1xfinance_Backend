import { Schema, model, Document, Types } from "mongoose";
import bcryptjs from "bcryptjs";
import { COUNTRY_CODE_REGEX, MOBILE_NUMBER_REGEX } from "../../utils/regex";
import config from "../../config/config";
export interface IMobileOTP extends Document {
  userId: Types.ObjectId;
  countryCode: string;
  mobileNumber: string;
  otpCode: string;
  attempts: number;
  expiresAt: Date;
  compareOTP(inputOtp: string): Promise<boolean>;
  updatedAt: Date;
}

const MobileOTPSchema = new Schema<IMobileOTP>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
      match: COUNTRY_CODE_REGEX,
      trim: true,
      default: config.defaultCountryCode,
    },
    mobileNumber: {
      type: String,
      required: true,
      match: MOBILE_NUMBER_REGEX,
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
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// TTL index for automatic expiration
MobileOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
MobileOTPSchema.index({ mobileNumber: 1 });
MobileOTPSchema.index({ userId: 1 });

MobileOTPSchema.pre("save", async function (next) {
  const mobileOTP = this as IMobileOTP;

  if (mobileOTP.isModified("otpCode")) {
    const salt = await bcryptjs.genSalt(10);
    mobileOTP.otpCode = await bcryptjs.hash(mobileOTP.otpCode, salt);
  }

  next();
});

MobileOTPSchema.methods.compareOTP = async function (inputOtp: string) {
  return bcryptjs.compare(inputOtp, this.otpCode);
};

const MobileOTP = model<IMobileOTP>("MobileOTP", MobileOTPSchema);

export default MobileOTP;
