import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import InvestorServices from "../../services/user/investor.service";
import { calculatePagination } from "../../utils/calculatePagination";
import { sendPaginatedResponse } from "../../utils/sendPaginatedResponse";
import { IUser } from "../../interfaces/user/user.interface";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";

const InvestorController = {
  getUser: catchAsync(async (req: Request, res: Response) => {
    // Ensure user is authenticated and has an ID
    const user = req.user as (IUser & { id: string }) | undefined;
    if (!user || (!user._id && !user.id)) {
      throw new ApiError({
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'User not authenticated or invalid user data',
      });
    }
    // Use either _id or id, whichever is available
    const userId = (user._id || user.id).toString();
    const userData = await InvestorServices.getUser(userId);
    sendResponse(res, 200, {
      data: userData,
      message: "User retrieved successfully",
    });
  }),

  getInvestorDetailsWithWallet: catchAsync(
    async (req: Request, res: Response) => {
      const user = req.user as (IUser & { id: string }) | undefined;
      if (!user || (!user._id && !user.id)) {
        throw new ApiError({
          statusCode: httpStatus.UNAUTHORIZED,
          message: 'User not authenticated or invalid user data',
        });
      }
      const investorId = (user._id || user.id).toString();
      const userData = await InvestorServices.getInvestorDetailsWithWallet(investorId);
      sendResponse(res, 200, {
        data: userData,
        message: "Profile retrieved successfully",
      });
    }
  ),

  getInvestorListing: catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { investors, totalCount } =
      await InvestorServices.getInvestorListing({
        filter: req.query,
        page,
        limit,
      });
    const pagination = calculatePagination({ page, limit, totalCount });
    sendPaginatedResponse(
      res,
      investors,
      pagination,
      "Investors retrieved successfully"
    );
  }),

  updateUser: catchAsync(async (req: Request, res: Response) => {
    const user = req.user as (IUser & { id: string }) | undefined;
    if (!user || (!user._id && !user.id)) {
      throw new ApiError({
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'User not authenticated or invalid user data',
      });
    }
    const userId = (user._id || user.id).toString();
    const updateData = req.body;
    const updatedUser = await InvestorServices.updateUser({ userId, updateData });
    sendResponse(res, 200, {
      data: updatedUser,
      message: "User updated successfully",
    });
  }),

  deleteUser: catchAsync(async (req: Request, res: Response) => {
    const user = req.user as (IUser & { id: string }) | undefined;
    if (!user || (!user._id && !user.id)) {
      throw new ApiError({
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'User not authenticated or invalid user data',
      });
    }
    const userId = (user._id || user.id).toString();
    const deletedUser = await InvestorServices.deleteUser(userId);
    sendResponse(res, 200, {
      data: deletedUser,
      message: "User deleted successfully",
    });
  }),
  
  getInvestors: catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { investors, totalCount } = await InvestorServices.getUsers({
      page,
      limit,
    });
    const pagination = calculatePagination({ page, limit, totalCount });
    sendPaginatedResponse(
      res,
      investors,
      pagination,
      "Investors retrieved successfully"
    );
  }),
};

export default InvestorController;
