import { generateOTP } from "../../utils/otpGenerator";
import MobileOTP from "../../models/otp/mobileOtp.model";
import {
  MOBILE_OTP_CONFIG,
  MOBILE_OTP_EXPIRATION_TIME_MS,
  MINIMUM_RESEND_INTERVAL_MS,
  CONST_TOKENS,
} from "../../config/constants/global";
import {
  OTPAttemptsExceededError,
  OTPExpiredError,
  OTPVerificationFailedError,
} from "../../errors/customErrors";
import config from "../../config/config"; 
// import sendMobileOTP from "../../config/mobileOtp";
// import { handleSendOTPResponse } from "../../helpers/mobileOtp.helper";
import User from "../../models/user/user.model";
import jwtToken from "./jwtToken.service";
import { tokenTypes } from "../../config/tokens";

const MobileOTPService = {
  async send({
    mobileNumber,
    userId,
    isForgotPassword = false,
  }: {
    mobileNumber: string;
    userId: string;
    isForgotPassword?: boolean;
  }) {
    // const otp = generateOTP(MOBILE_OTP_CONFIG.OTP_LENGTH);
    const otp  = "123456";

    const otpExpiry = new Date(Date.now() + MOBILE_OTP_EXPIRATION_TIME_MS);
    // const apiResult = await sendMobileOTP({ mobileNumber, otp, isForgotPassword });
    
    // handleSendOTPResponse(apiResult);

    const existingOtp = await MobileOTP.findOne({ userId });

    if (existingOtp) {
      const timeSinceLastUpdate = Date.now() - new Date(existingOtp.updatedAt).getTime();
      if (timeSinceLastUpdate < MINIMUM_RESEND_INTERVAL_MS) {
        throw new Error("Please wait before requesting a new OTP.");
      }

      if (existingOtp.attempts >= MOBILE_OTP_CONFIG.MAX_ATTEMPTS) {
        throw new OTPAttemptsExceededError(MOBILE_OTP_CONFIG.EXPIRATION_TIME_MINUTES);
      }

      existingOtp.otpCode = otp;
      existingOtp.expiresAt = otpExpiry;
      existingOtp.attempts += 1;
      await existingOtp.save();
    } else {
      await MobileOTP.create({
        userId,
        mobileNumber,
        otpCode: otp,
        expiresAt: otpExpiry,
        countryCode: config.defaultCountryCode,
        attempts: 1,
      });
    }
  },

  async verify({
    userId,
    otpCode,
  }: {
    userId: string;
    otpCode: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const mobileOtp = await MobileOTP.findOne({ userId });
    if (!mobileOtp) {
      throw new OTPVerificationFailedError("OTP not found");
    }

    if (mobileOtp.attempts >= MOBILE_OTP_CONFIG.MAX_ATTEMPTS) {
      throw new OTPAttemptsExceededError(MOBILE_OTP_CONFIG.EXPIRATION_TIME_MINUTES);
    }

    if (mobileOtp.expiresAt < new Date()) {
      throw new OTPExpiredError("OTP expired. Please request a new OTP.");
    }

    const isValidOtp = await mobileOtp.compareOTP(otpCode);
    if (!isValidOtp) {
      mobileOtp.attempts += 1;
      await mobileOtp.save();
      throw new OTPVerificationFailedError("Invalid OTP");
    }

    await Promise.all([
      User.findOneAndUpdate(
        { _id: userId },
        { $set: { isMobileNumVerified: true } },
        { new: true }
      ),
      MobileOTP.deleteOne({ userId }),
    ]);

    const [ accessToken, refreshToken ] = await Promise.all([ 
      jwtToken.generate({
        payload: { _id: userId },
        tokenType: tokenTypes.ACCESS as keyof typeof tokenTypes,
      }),
      jwtToken.generate({
        payload: { _id: userId },
        tokenType: tokenTypes.REFRESH as keyof typeof tokenTypes,
      }),
    ]);

    return { accessToken, refreshToken };
  },
};

export default MobileOTPService;
