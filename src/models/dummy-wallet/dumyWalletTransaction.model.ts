// src/models/wallet/walletTransaction.model.ts
import mongoose, { Schema, Document } from "mongoose";

export type TTxnType = "credit" | "debit";

export interface IWalletTransactionDocument extends Document {
  accountId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  currency: string;
  type: TTxnType;
  amount: number;           // positive
  balanceAfter: number;     // snapshot after txn
  reference: string;        // idempotency key (unique per account)
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransactionDocument>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "WalletAccount", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "Investor", required: true, index: true },
    currency: { type: String, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true },
    reference: { type: String, required: true }, // idempotency
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// idempotency: one txn per (accountId, reference)
WalletTransactionSchema.index(
  { accountId: 1, reference: 1 },
  { unique: true, name: "uniq_txn_reference_per_account" }
);

export const WalletTransaction =
  mongoose.models.WalletTransaction ||
  mongoose.model<IWalletTransactionDocument>("WalletTransaction", WalletTransactionSchema);
``