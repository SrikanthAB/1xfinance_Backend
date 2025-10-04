import { Document, Schema, model } from "mongoose";
import { 
  IGlobalFeeConfig,
} from "../../interfaces/config/globalFeeConfig.types";
import { AssetClass, AssetCategory } from "../../interfaces/asset/asset.types";
import { FeeType } from "../../interfaces/config/globalFeeConfig.types";

export interface IGlobalFeeConfigDocument extends IGlobalFeeConfig, Document {}


const GlobalFeeConfigSchema = new Schema({
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
  feeType: {
    type: String,
    enum: Object.values(FeeType),
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    required: true
  },
  isPercentage: {
    type: Boolean,
    required: true
  },
  status: {
    type: Boolean,
    required: true,
    default: true
  }
}, { timestamps: true });

const GlobalFeeConfig = model<IGlobalFeeConfigDocument>('GlobalFeeConfig', GlobalFeeConfigSchema);
export default GlobalFeeConfig; 