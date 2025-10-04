import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AdminServices from "../../services/admin/admin.service";
import jwtToken from "../../services/user/jwtToken.service";
import { tokenTypes } from "../../config/tokens";
import { calculatePagination } from "../../utils/calculatePagination";
import { sendPaginatedResponse } from "../../utils/sendPaginatedResponse";
import { IUser } from "../../interfaces/user/user.interface";

// Extend the Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser & { id: string };
    }
  }
}

const AdminController = {
  adminLogin: catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const adminTokens = await AdminServices.adminLogin({ email, password });
    sendResponse(res, 200, {
      data: adminTokens,
      message: "Admin login successfully",
    });
  }),

  getAdminDetails: catchAsync(async (req: Request, res: Response) => {
    // The user ID is attached to the request by the authenticateAdmin middleware
    const adminId = req.user?._id;
    
    if (!adminId) {
      throw new Error('Admin ID not found in request');
    }
    
    // Convert adminId to string if it's an ObjectId
    const adminDetails = await AdminServices.getAdminDetails(adminId.toString());
    
    sendResponse(res, 200, {
      data: adminDetails,
      message: 'Admin details retrieved successfully',
    });
  }),

  // getAllOrdersByFilter: catchAsync(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const pageNum = Number(req.query.page) || 1;
  //     const limitNum = Number(req.query.limit) || 10;
  //     const { orders, totalCount } = await OrderService.getAllOrdersByFilter({
  //       ...req.query,
  //     });
  //     const pagination = calculatePagination({
  //       page: pageNum,
  //       limit: limitNum,
  //       totalCount,
  //     });
  //     sendPaginatedResponse(
  //       res,
  //       orders,
  //       pagination,
  //       "Orders retrieved successfully"
  //     );
  //   }
  // ),

  refreshAccessToken: catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const accessToken = await jwtToken.verify({
      token: refreshToken,
      tokenType: tokenTypes.ADMIN_REFRESH,
    });

    if (!accessToken) {
      return sendResponse(res, 401, {
        message: "Invalid or expired refresh token",
      });
    }

    // Generate a new access token
    const newAccessToken = jwtToken.generate({
      payload: { _id: accessToken._id, role: accessToken.role },
      tokenType: tokenTypes.ADMIN_ACCESS as keyof typeof tokenTypes,
    });

    sendResponse(res, 200, {
      message: "Access token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken,
      },
    });
  }),
};

export default AdminController;



// model schema design
// controller 
// services logic
// middleware all auth 
// routes routings
// interfaces and types
// utils helper functions