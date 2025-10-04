import { Document, Schema, model } from "mongoose";
import { 
  IGlobalAdditionalTax
} from "../../interfaces/config/globalAdditionalTax.types";
import { AssetClass, AssetCategory } from "../../interfaces/asset/asset.types";

export interface IGlobalAdditionalTaxDocument extends IGlobalAdditionalTax, Document {}

const GlobalAdditionalTaxSchema = new Schema({
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
  value: {
    type: Number,
    required: true
  },
  status: {
    type: Boolean,
    required: true,
    default: true
  }
}, { timestamps: true });

const GlobalAdditionalTax = model<IGlobalAdditionalTaxDocument>('GlobalAdditionalTax', GlobalAdditionalTaxSchema);
export default GlobalAdditionalTax; 