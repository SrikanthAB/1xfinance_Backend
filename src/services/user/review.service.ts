
import Review, { IReview } from '../../models/user/review.model';
import findAllEntities from '../../utils/findAllEntities';
import Asset from '../../models/asset/asset.model';
import ApiError from '../../utils/ApiError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

export interface ExistingReview extends IReview {
  investorId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId;
}
const ReviewService = {
  async findReviewWithUser({assetId,investorId}: {assetId:string,investorId:string}): Promise<ExistingReview | null> {
    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new ApiError({ statusCode: httpStatus.NOT_FOUND, message: "Asset not found" })
    }
    const reviewWithUser: ExistingReview | null = await Review.findOne({
      investorId: investorId,
      assetId: assetId,
    });
    return reviewWithUser;
  },
  async createReview(review: IReview): Promise<IReview> {
    const newReview: IReview = await Review.create(review);
    if(!newReview){
       throw new ApiError({statusCode:httpStatus.INTERNAL_SERVER_ERROR,message:"Failed to create review"})
    }
    return newReview;
  },

  async getReviewById(id: string): Promise<IReview | null> {
    const review: IReview | null = await Review.findById(id);
    if (!review) {
      throw new ApiError({ statusCode: httpStatus.NOT_FOUND, message: "Review not found" })
    }
    return review;
  },

  async findAllReviews({ page = 1, limit = 1000, }: { page: number; limit: number; }): Promise<{ reviews: IReview[]; totalCount: number }> {
    // Use the findAllEntities utility
    const { entities, totalCount } = await findAllEntities({
      page,
      limit,
      model: Review,
    });
    return { reviews: entities as IReview[], totalCount };
  },

  async updateReview(id: string, review: Partial<IReview>): Promise<IReview | null> {
    const { rating, review: reviewText } = review;
    if (rating && (rating < 1 || rating > 5)) {
      throw new Error('Rating should be between 1 and 5');
    }
    if (reviewText && reviewText.length > 300) {
      throw new Error('Review should be less than 300 characters');
    }

    const updatedReview: IReview | null = await Review.findByIdAndUpdate(
      id,
      review,
      { new: true }
    );
    if (!updatedReview) {
      throw new ApiError({ statusCode: httpStatus.NOT_FOUND, message: "Review not found or could not be updated" })
    }
    return updatedReview;
  },

  async deleteReview(id: string): Promise<IReview | null> {
    const deletedReview: IReview | null = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      throw new ApiError({ statusCode: httpStatus.NOT_FOUND, message: "Review not found" })
    }
    return deletedReview;
  },
};

export default ReviewService;

