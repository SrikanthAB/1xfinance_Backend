import { Document, Schema, model } from "mongoose";
import { 
  IGlobalFAQ
} from "../../interfaces/config/globalFAQ.types";
import {AssetClass, AssetCategory} from "../../interfaces/asset/asset.types";

export interface IGlobalFAQDocument extends IGlobalFAQ, Document {}

const GlobalFAQSchema = new Schema({
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
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
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

const GlobalFAQ = model<IGlobalFAQDocument>('GlobalFAQ', GlobalFAQSchema);
export default GlobalFAQ; 