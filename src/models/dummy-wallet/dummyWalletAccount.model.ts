// src/models/wallet/walletAccount.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IWalletAccountDocument extends Document {
  ownerId: mongoose.Types.ObjectId;
  currency: string;     // "INR" | "USD" | "USDC"
  balance: number;      // major units, rounded to 2 decimals
  label?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletAccountSchema = new Schema<IWalletAccountDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "Investor", required: true, index: true },
    currency: { type: String, required: true, index: true },
    balance: { type: Number, required: true, default: 0 }, // store as Number, 2 decimals
    label: { type: String },
  },
  { timestamps: true }
);

WalletAccountSchema.index({ ownerId: 1, currency: 1 }, { unique: true, name: "uniq_owner_currency" });

export const WalletAccount =
  mongoose.models.WalletAccount ||
  mongoose.model<IWalletAccountDocument>("WalletAccount", WalletAccountSchema);
