import { IReview } from "../../models/user/review.model";
import catchAsync from "../../utils/catchAsync";
import type { Response } from 'express';
// Import the extended Express types to ensure they're registered
import { Request } from 'express';
import ReviewService from "../../services/user/review.service";
import sendResponse from "../../utils/sendResponse";
import { calculatePagination } from "../../utils/calculatePagination";
import { Types } from "mongoose";

const ReviewController = {
  createReview: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const assetId = req.query.assetId as string;
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      
      const investorId = req.user.id;
      const review: IReview = req.body;
      const existingReview = await ReviewService.findReviewWithUser({
        assetId,
        investorId
      });
      
      if (existingReview) {
        const updatedReview: IReview | null = await ReviewService.updateReview(
          existingReview.id,
          review
        );
        sendResponse(res, 200, {
          message: "Review Updated Successfully",
          data: updatedReview,
        });
      } else {
        const newReview: IReview = await ReviewService.createReview({
          ...req.body,  
          investorId: new Types.ObjectId(investorId),
          assetId: new Types.ObjectId(assetId)
        });
        sendResponse(res, 200, {
          data: newReview,
          message: "Review Created successfully",
        });
      }
    }
  ),

  getReviewById: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const review: IReview | null = await ReviewService.getReviewById(id);
      sendResponse(res, 200, {
        data: review,
        message: "Review Found successfully",
      });
    }
  ),

  findAllReviews: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const {
        page = 1,
        limit = 10,
      }: { page?: number; limit?: number} = req.query;
      const pageNum = parseInt(page.toString(), 10);
      const limitNum = parseInt(limit as unknown as string, 10);
      const { reviews, totalCount } = await ReviewService.findAllReviews({
        page: pageNum,
        limit: limitNum,
      });
      const pagination = calculatePagination({
        page: pageNum,
        limit: limitNum,
        totalCount,
      });
      sendResponse(res, 200, {
        data: reviews,
        message: "Reviews Found successfully",
        pagination,
      });
    }
  ),

  updateReview: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const review: Partial<IReview> = req.body;
      const updatedReview: IReview | null = await ReviewService.updateReview(id,review);
      sendResponse(res, 200, {
        data: updatedReview,
        message: "Review Updated successfully",
      });
    }
  ),

  deleteReview: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const deletedReview: IReview | null = await ReviewService.deleteReview(id);
      sendResponse(res, 200, {
        data: deletedReview,
        message: "Review Deleted successfully",
      });
    }
  ),
};

export default ReviewController;
