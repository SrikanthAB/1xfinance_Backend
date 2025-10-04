import { Document, Schema, model } from "mongoose";
import { 
  IGlobalExitOpportunity
} from "../../interfaces/config/globalExitOpportunity.types";
import { AssetClass, AssetCategory } from "../../interfaces/asset/asset.types";

export interface IGlobalExitOpportunityDocument extends IGlobalExitOpportunity, Document {}

const GlobalExitOpportunitySchema = new Schema({
  assetClass: {
    type: String,
    enum: Object.values(AssetClass),
    required: true
  },
  assetCategory: {
    type: String,
    enum: Object.values(AssetCategory),
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: Boolean,
    required: true,
    default: true
  }
}, { timestamps: true });

const GlobalExitOpportunity = model<IGlobalExitOpportunityDocument>('GlobalExitOpportunity', GlobalExitOpportunitySchema);
export default GlobalExitOpportunity; 