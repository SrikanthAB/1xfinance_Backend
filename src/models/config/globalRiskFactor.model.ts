import { Document, Schema, model } from "mongoose";
import { 
  IGlobalRiskFactor
} from "../../interfaces/config/globalRiskFactor.types";
import { AssetClass, AssetCategory } from "../../interfaces/asset/asset.types";

export interface IGlobalRiskFactorDocument extends IGlobalRiskFactor, Document {}

const GlobalRiskFactorSchema = new Schema({
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

const GlobalRiskFactor = model<IGlobalRiskFactorDocument>('GlobalRiskFactor', GlobalRiskFactorSchema);
export default GlobalRiskFactor; 