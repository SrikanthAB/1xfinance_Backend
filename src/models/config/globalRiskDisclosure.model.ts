import { Document, Schema, model } from "mongoose";
import { 
  IGlobalRiskDisclosure
} from "../../interfaces/config/globalRiskDisclosure.types";
import { AssetClass, AssetCategory } from "../../interfaces/asset/asset.types";

export interface IGlobalRiskDisclosureDocument extends IGlobalRiskDisclosure, Document {}

const GlobalRiskDisclosureSchema = new Schema({
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

const GlobalRiskDisclosure = model<IGlobalRiskDisclosureDocument>('GlobalRiskDisclosure', GlobalRiskDisclosureSchema);
export default GlobalRiskDisclosure; 