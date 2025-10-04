import { Document, Schema, model } from "mongoose";
import { IAssetDueDiligenceStructure } from "../../interfaces/asset/assetDueDiligenceStructure.types";

export interface IAssetDueDiligenceStructureDocument extends IAssetDueDiligenceStructure, Document {}

// Asset Due Diligence Structure Schema
const AssetDueDiligenceStructureSchema = new Schema({
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

const AssetDueDiligenceStructure = model<IAssetDueDiligenceStructureDocument>('AssetDueDiligenceStructure', AssetDueDiligenceStructureSchema);
export default AssetDueDiligenceStructure; 