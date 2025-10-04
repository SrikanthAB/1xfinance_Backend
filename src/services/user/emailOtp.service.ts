import { generateOTP } from "../../utils/otpGenerator";
import { sendOtpToEmail, sendWelcomeEmail } from "../../utils/sendMail";
import User from "../../models/user/user.model";
import EmailOTP from "../../models/otp/emailOtp.model";
import ApiError from "../../utils/ApiError";
import { OTPAttemptsExceededError } from "../../errors/customErrors";
import { EMAIL_OTP_CONFIG, OTP_EXPIRATION_TIME_MS } from "../../config/constants/global";

const generateEmailOTP = async (userId: string, newEmail: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError({ statusCode: 404, message: "User not found" });
  }

  // If user is trying to use the same email
  if (user.email === newEmail) {
    throw new ApiError({
      statusCode: 400,
      message: "You have entered the same email as your current email.",
    });
  }

  // Check if another user already uses this email
  const emailInUse = await User.findOne({ email: newEmail, _id: { $ne: userId } });
  if (emailInUse) {
    throw new ApiError({
      statusCode: 400,
      message: "This email is already in use by another user.",
    });
  }

  // Update the current user's email
  user.email = newEmail;
  await user.save();

  // Check for existing OTP for the new email
  let existingOTP = await EmailOTP.findOne({ email: newEmail });

  const otp = generateOTP(EMAIL_OTP_CONFIG.OTP_LENGTH);
  const otpExpiry = new Date(Date.now() + OTP_EXPIRATION_TIME_MS);

  if (existingOTP) {
    if (existingOTP.attempts >= EMAIL_OTP_CONFIG.MAX_ATTEMPTS) {
      throw new OTPAttemptsExceededError();
    }

    existingOTP.attempts += 1;
    existingOTP.otpCode = otp;
    existingOTP.expiresAt = otpExpiry;
    await existingOTP.save();
  } else {
    await EmailOTP.create({
      userId: user._id,
      email: newEmail,
      otpCode: otp,
      expiresAt: otpExpiry,
    });
  }

  return { userId: user._id, otp };
};

const emailOtpService = {
    async generateAndSendOTP(userId: string, email: string): Promise<void> {
        const { otp } = await generateEmailOTP(userId, email);
        await sendOtpToEmail(email, otp);
        },
    async verifyOTP(userId: string, otp: string): Promise<void> {
        const emailOTP = await EmailOTP.findOne({ userId });
        if (!emailOTP) {
            throw new ApiError({ statusCode: 404, message: "OTP not found" });
        }

        if (emailOTP.attempts >= EMAIL_OTP_CONFIG.MAX_ATTEMPTS) {
            throw new OTPAttemptsExceededError();
        }

        if (emailOTP.expiresAt < new Date()) {
            throw new ApiError({ statusCode: 400, message: "OTP expired" });
        }

        const isValidOtp = await emailOTP.compareOTP(otp);    
        if (!isValidOtp) {
            emailOTP.attempts += 1;
            await emailOTP.save();
            throw new ApiError({ statusCode: 400, message: "Invalid OTP" });    
        }
        }
    };

export default emailOtpService;