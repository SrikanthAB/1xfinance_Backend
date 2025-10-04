import mongoose, { Document, Schema } from 'mongoose';
import { AssetCategory, AssetClass } from '../../interfaces/asset/asset.types';

// Define an interface representing a global feature document in MongoDB.
export interface IGlobalFeature extends Document {
  assetCategory: AssetCategory;
  assetClass: AssetClass;
  name: string;
  description: string;
  type: string;
  image: string;
  status: boolean;
  createdAt: Date;
}

// Define the schema corresponding to the document interface.
const GlobalFeatureSchema: Schema = new Schema<IGlobalFeature>(
  {
    assetCategory: {
      type: String,
      enum: Object.values(AssetCategory),
      required: true,
      trim: true,
    },
    assetClass: {
      type: String,
      enum: Object.values(AssetClass),
      required: true,
      default: AssetClass.REAL_ESTATE,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Export the model using the interface for type checking.
const GlobalFeature = mongoose.model<IGlobalFeature>('GlobalFeature', GlobalFeatureSchema);
export default GlobalFeature; 