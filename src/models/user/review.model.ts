import mongoose, { Document, Schema } from 'mongoose';

// Define an interface representing a review document in MongoDB.
export interface IReview extends Document {
  assetId: mongoose.Types.ObjectId;
  investorId: mongoose.Types.ObjectId;
  review: string;
  rating: number;
}

// Define the schema corresponding to the document interface.
const ReviewSchema = new Schema<IReview>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true
    },
    investorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    review: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Export the model using the interface for type checking.
const Review = mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
