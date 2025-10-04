// src/models/asset/investorRentalPayment.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IInvestorRentalPaymentDocument extends Document {
  rentalDistributionId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId;
  investorId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;

  distributionMonth: Date;
  distributionYear: number;

  investorTokens: number;
  ownershipPercentage: number; // snapshot %
  grossRentalIncome: number;
  totalExpenses: number;
  netRentalIncome: number;
  investorShare: number;       // amount to pay this investor for the month

  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  paymentMethod?: "crypto" | "fiat" | "wallet";
  paymentTransactionId?: string;
  paymentNotes?: string;
  paidAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const InvestorRentalPaymentSchema = new Schema<IInvestorRentalPaymentDocument>(
  {
    rentalDistributionId: { type: Schema.Types.ObjectId, ref: "RentalDistribution", required: true, index: true },
    assetId: { type: Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
    investorId: { type: Schema.Types.ObjectId, ref: "Investor", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },

    distributionMonth: { type: Date, required: true, index: true },
    distributionYear: { type: Number, required: true },

    investorTokens: { type: Number, required: true, min: 0 },
    ownershipPercentage: { type: Number, required: true, min: 0 },
    grossRentalIncome: { type: Number, required: true, min: 0 },
    totalExpenses: { type: Number, required: true, min: 0 },
    netRentalIncome: { type: Number, required: true, min: 0 },
    investorShare: { type: Number, required: true, min: 0 },

    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "pending", index: true },
    paymentMethod: { type: String, enum: ["crypto", "fiat", "wallet"] },
    paymentTransactionId: { type: String },
    paymentNotes: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

// idempotency: one payment per investor-order per distribution
InvestorRentalPaymentSchema.index(
  { rentalDistributionId: 1, investorId: 1, orderId: 1 },
  { unique: true, name: "uniq_payment_per_order" }
);

export const InvestorRentalPayment =
  mongoose.models.InvestorRentalPayment ||
  mongoose.model<IInvestorRentalPaymentDocument>("InvestorRentalPayment", InvestorRentalPaymentSchema);
