import {
  EOrderTrackingStatus,
  IOrder,
} from "../../interfaces/order/order.interface";
import { Document, Schema, model } from "mongoose";
import { Currency } from "../../interfaces/asset/asset.types";
export interface IOrderDocument extends IOrder, Document {}

export const TransactionSchema = new Schema({
  statusCode: { type: String, required: true },
  statusMessage: { type: String, required: true },
  referenceId: { type: String, default: "" },
  amount: { type: Number, required: true },
  checkoutRequestId: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  status: { type: String, enum: ["SUCCESS", "FAILED"], required: true },
});

const OrderSchema: Schema = new Schema<IOrderDocument>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    investorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    tokensBooked: {
      type: Number,
      required: true,
    },
    blockchainOrderId: {
      type: Number,
    },
    ownershipPercentage: {
      type: Number,
      required: true,
    },
    totalOrderValue: {
      type: Number,
      trim: true,
    },
    totalFeePaid: {
      type: Number,
      trim: true,
      default: null,
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      required: true,
      default: Currency.KES,
    },
    breakup: {
      type: [
        {
          name: String,
          value: Number,
          percentage: Number || null,
          isPercentage: Boolean,
        },
      ],
      default: [],
    },
    currentStatus: {
      type: String,
      defaultValue: EOrderTrackingStatus.ORDER_CREATED,
      enum: Object.values(EOrderTrackingStatus),
    },
    transaction: { type: TransactionSchema, default: null },
    transactionHash: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
      validate: {
        validator: function (value: string | undefined) {
          return value === undefined || /^0x[a-fA-F0-9]{64}$/.test(value);
        },
        message:
          "Invalid transaction hash format. Must be a 66-character hex string starting with 0x.",
      },
    },
    blockNumber: {
      type: Number,
      min: 0,
      sparse: true,
    },
  },
  { timestamps: true }
);

const Order = model<IOrderDocument>("Order", OrderSchema);
export default Order;
