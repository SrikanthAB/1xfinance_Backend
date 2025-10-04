import mongoose, { Document, Schema } from 'mongoose';

// Define an interface representing a fee percentage document in MongoDB.
export interface IFeePercentage extends Document {
  name: string;
  type: string;
  value: number;
  isActive: boolean;
  isPercentage: boolean;
}

// Define the schema corresponding to the document interface.
const FeePercentageSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPercentage: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Export the model using the interface for type checking.
const FeePercentage = mongoose.model<IFeePercentage>('FeePercentage', FeePercentageSchema);
export default FeePercentage;

