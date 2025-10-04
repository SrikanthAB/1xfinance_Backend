// src/models/asset/rentalDistribution.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRentalDistributionDocument extends Document {
  assetId: mongoose.Types.ObjectId;
  distributionMonth: Date;  // first day of month
  distributionYear: number;
  grossRentalIncome: number;
  expenses: { label: string; amount: number; code?: string }[];
  totalExpenses: number;
  netRentalIncome: number;
  totalTokensDistributed: number; // snapshot
  distributionPerToken: number;   // snapshot
  status: "draft" | "ready" | "distributed" | "cancelled";
  distributionNotes?: string;
  distributedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  totalTokensSupply: number;
}

const ExpenseSchema = new Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    code: { type: String },
  },
  { _id: false }
);

const RentalDistributionSchema = new Schema<IRentalDistributionDocument>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
    distributionMonth: { type: Date, required: true, index: true },
    distributionYear: { type: Number, required: true, index: true },
    grossRentalIncome: { type: Number, required: true, min: 0 },
    expenses: { type: [ExpenseSchema], default: [] },
    totalExpenses: { type: Number, required: true, min: 0 },
    netRentalIncome: { type: Number, required: true, min: 0 },
    totalTokensDistributed: { type: Number, required: true, min: 0 },
    distributionPerToken: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["draft", "ready", "distributed", "cancelled"], default: "ready", index: true },
    distributionNotes: { type: String },
    distributedAt: { type: Date },
    totalTokensSupply: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

RentalDistributionSchema.index(
  { assetId: 1, distributionMonth: 1 },
  { unique: true, name: "uniq_asset_month" }
);

export const RentalDistribution =
  mongoose.models.RentalDistribution ||
  mongoose.model<IRentalDistributionDocument>("RentalDistribution", RentalDistributionSchema);
