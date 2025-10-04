import { Document, Schema, model } from "mongoose";
import { IAssetExpense } from "../../interfaces/asset/assetExpense.types";

export interface IAssetExpenseDocument extends IAssetExpense, Document {}

// Asset Expense Schema
const AssetExpenseSchema = new Schema({
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  isPercentage: {
    type: Boolean,
    default: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const AssetExpense = model<IAssetExpenseDocument>('AssetExpense', AssetExpenseSchema);
export default AssetExpense; 