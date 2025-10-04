import mongoose, { Document, Schema } from "mongoose";

export interface IPaymentToken extends Document {
  accessToken: string;
  createdAt?: Date;
  expiresAt?: Date; // for TTL
}

const PaymentTokenSchema: Schema = new Schema(
  {
    accessToken: { type: String, required: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
      index: { expireAfterSeconds: 0 }, // TTL triggers at expiresAt exactly
    },
  },
  { timestamps: true }
);

const PaymentToken = mongoose.model<IPaymentToken>(
  "PaymentToken",
  PaymentTokenSchema
);
export default PaymentToken;
