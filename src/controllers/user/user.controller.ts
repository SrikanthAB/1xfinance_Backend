import type { Response } from 'express';
// Import the extended Express types to ensure they're registered
import { Request } from 'express';
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import UserSerivice from "../../services/user/user.service";
import MobileOTPService from "../../services/user/mobileOtp.service";
import jwtToken from "../../services/user/jwtToken.service";
import { tokenTypes } from "../../config/tokens";

const UserController = {
  login: catchAsync(async (req: Request, res: Response) => {
    const { mobileNumber, countryCode, password } = req.body;
    console.log("Login request body:", req.body);
    const user = await UserSerivice.findByMobileNumber({
      mobileNumber,
      countryCode,
    });
    console.log("User found:", user);
    
    if (!user) {
      return sendResponse(res, 404, {
        message: "User not found",
      });
    }
    const comparedPassword = await user.comparePassword(password);
    console.log("Password comparison result:", comparedPassword);
    if (!comparedPassword) {
      return sendResponse(res, 401, {
        message: "Invalid password",
      });
    }
    // If the user is not verified, we send the OTP
    await MobileOTPService.send({
      userId: String(user._id) || "",
      mobileNumber,
    });

    const withpassword = {
      ...user.toObject(),
      password: undefined, // Exclude password from the response
    };
    console.log("User data without password:", withpassword);

    sendResponse(res, 200, {
      data: withpassword,
      message: "OTP sent successfully",
    });
  }),

  register: catchAsync(async (req: Request, res: Response) => {
    const { mobileNumber, countryCode, password } = req.body;
    const existingUser = await UserSerivice.findByMobileNumber({
      mobileNumber,
      countryCode,
    });
    if (existingUser) {
      return sendResponse(res, 409, {
        message: "User already exists",
      });
    }
    const newUser = await UserSerivice.createUser({
      mobileNumber,
      countryCode,
      password,
    });

    // If the user is not verified, we send the OTP
    await MobileOTPService.send({
      userId: String(newUser._id) || "",
      mobileNumber,
    });
    const withpassword = {
      ...newUser.toObject(),
      password: undefined, // Exclude password from the response
    };

    sendResponse(res, 201, {
      message: "User created successfully",
      data: withpassword,
    });
  }),

  forgotPassword: catchAsync(async (req: Request, res: Response) => {
    const { mobileNumber, countryCode } = req.body;
    const user = await UserSerivice.findUserWithMobileNumber({
      mobileNumber,
      countryCode,
    });
    if (!user) {
      return sendResponse(res, 404, {
        message: "User not found",
      });
    }
    // If the user is found, we send the OTP
    await MobileOTPService.send({
      userId: String(user._id),
      mobileNumber,
      isForgotPassword: true,
    });
    sendResponse(res, 200, {
      message: "OTP sent successfully",
      data: user,
    });
  }),

  verifyMobileOTP: catchAsync(async (req: Request, res: Response) => {
    const { otpCode } = req.body;
    const { userId } = req.params;
    const { accessToken, refreshToken } = await MobileOTPService.verify({
      userId,
      otpCode,
    });

    sendResponse(res, 200, {
      message: "OTP verified successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  }),

  getUserDetails: catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const userId = req.user.id;
    const user = await UserSerivice.getUserById(userId);
    sendResponse(res, 200, {
      message: "User details fetched successfully",
      data: user,
    });
  }),

  updateUserDetails: catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const userId = req.user.id;
    const updateData = req.body;
    const user = await UserSerivice.updateUserById(userId, updateData);
    const withoutPassword = { ...user };
    withoutPassword.password = undefined;
    sendResponse(res, 200, {
      message: "User details updated successfully",
      data: withoutPassword,
    });
  }),

  refreshAccessToken: catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const accessToken = await jwtToken.verify({
      token: refreshToken,
      tokenType: tokenTypes.REFRESH,
    });

    if (!accessToken) {
      return sendResponse(res, 401, {
        message: "Invalid or expired refresh token",
      });
    }

    // Generate a new access token
    const newAccessToken = jwtToken.generate({
      payload: { _id: accessToken._id, role: accessToken.role },
      tokenType: tokenTypes.ACCESS as keyof typeof tokenTypes,
    });

    sendResponse(res, 200, {
      message: "Access token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken, // Optionally return the same refresh token
      },
    });
  }),

  updateWalletAddress: catchAsync(async (req: Request, res: Response) => {
    const { walletAddress } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return sendResponse(res, 401, {
        message: 'Authentication required',
      });
    }

    const user = await UserSerivice.updateWalletAddress(userId, walletAddress);
    
    sendResponse(res, 200, {
      message: 'Wallet address updated successfully',
      data: user,
    });
  }),
};

export default UserController;
