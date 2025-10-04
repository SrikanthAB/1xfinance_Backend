import type { Response } from 'express';
// Import the extended Express types to ensure they're registered
import { Request } from 'express';
import MobileOTPService from "../../services/user/mobileOtp.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const MobileOTPCController = {
  sendMobileOTP: catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const userId = req.user.id; // Now properly typed as string
    // const response = await MobileOTPService.sendOTPToMobile({
    //   ...req.body,
    //   userId,
    // });
    // sendResponse(res, response.status, {
    //   message: response.message,
    // });
  }),
  
  verifyMobileOTP: catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const userId = req.user.id; // Now properly typed as string
    // await MobileOTPService.verifyMobileOTP({ otp: req.body.otp, userId });
    // sendResponse(res, 200, {
    //   message: "OTP verified successfully",
    // });
  }),
};

export default MobileOTPCController;
