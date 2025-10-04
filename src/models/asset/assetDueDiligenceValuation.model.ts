import { Document, Schema, model } from "mongoose";
import { IAssetDueDiligenceValuation } from "../../interfaces/asset/assetDueDiligenceValuation.types";

export interface IAssetDueDiligenceValuationDocument extends IAssetDueDiligenceValuation, Document {}

// Asset Due Diligence Valuation Schema
const AssetDueDiligenceValuationSchema = new Schema({
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  logoUrl: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
}, { timestamps: true });

const AssetDueDiligenceValuation = model<IAssetDueDiligenceValuationDocument>('AssetDueDiligenceValuation', AssetDueDiligenceValuationSchema);
export default AssetDueDiligenceValuation; 