import { Document, Schema, model } from "mongoose";
import { IAssetFeeConfig, FeeType } from "../../interfaces/asset/assetFeeConfig.types";

export interface IAssetFeeConfigDocument extends IAssetFeeConfig, Document {}

const AssetFeeConfigSchema = new Schema({
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  type: {
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
    required: true,
    min: 0
  },
  isPercentage: {
    type: Boolean,
    required: true,
    default: false
  },
  status: {
    type: Boolean,
    required: true,
    default: true
  }
}, { timestamps: true });

const AssetFeeConfig = model<IAssetFeeConfigDocument>('AssetFeeConfig', AssetFeeConfigSchema);
export default AssetFeeConfig; 