import { Document, Schema, model } from "mongoose";
import { IAssetDueDiligenceLegal } from "../../interfaces/asset/assetDueDiligenceLegal.types";

export interface IAssetDueDiligenceLegalDocument extends IAssetDueDiligenceLegal, Document {}

// Asset Due Diligence Legal Schema
const AssetDueDiligenceLegalSchema = new Schema({
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

const AssetDueDiligenceLegal = model<IAssetDueDiligenceLegalDocument>('AssetDueDiligenceLegal', AssetDueDiligenceLegalSchema);
export default AssetDueDiligenceLegal; 