import emailOtpService from "../../services/user/emailOtp.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import httpStatus from "http-status";

const emailOtpController = {
  generateAndSendOTP: catchAsync(async (req: Request, res: Response) => {
    const userId = req.body.userId as string;
    if (!userId) {
      return sendResponse(res, httpStatus.UNAUTHORIZED, {
        message: "Unauthorized. User ID missing.",
      });
    }

    const email = req.body.email as string;
    if (!email) {
      return sendResponse(res, httpStatus.BAD_REQUEST, {
        message: "Email is required.",
      });
    }

    await emailOtpService.generateAndSendOTP(userId, email);

    sendResponse(res, httpStatus.OK, {
      message: `OTP sent to your email: ${email}`,
    });
  }),

  verifyOTP: catchAsync(async (req: Request, res: Response) => {
    const userId = req.body.userId as string;
    if (!userId) {
      return sendResponse(res, httpStatus.UNAUTHORIZED, {
        message: "Unauthorized. User ID missing.",
      });
    }

    const otpCode = req.body.otp as string;
    if (!otpCode) {
      return sendResponse(res, httpStatus.BAD_REQUEST, {
        message: "OTP is required.",
      });
    }

    await emailOtpService.verifyOTP(userId, otpCode);

    sendResponse(res, httpStatus.OK, {
      message: "OTP verified successfully",
    });
  }),
};

export default emailOtpController;
