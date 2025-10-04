import { Schema } from "mongoose";
import { Currency } from "../../interfaces/asset/asset.types";

export enum EOrderTrackingStatus {
  ORDER_CREATED = "order-created",
  AWAITING_FOR_FULL_INVESTMENT = 'awaiting-100%-investment',
  FULLY_INVESTED = "fully-invested",
  AWAITING_FOR_DOCUMENTS_TO_BE_SIGNED = "awaiting-documents-to-be-signed",
  DOCUMENTS_SENT_FOR_SIGNATURE_TO_BE_SIGNED = "documents-sent-for-signature-to-be-signed",
  DOCUMENTS_SIGNED = "documents-signed",
  FULL_PAYMENT_PENDING = "full-payment-pending",
  FULLY_PAID = "fully-paid",
  PROPERTY_TOKENS_TRANSFER_PENDING = "property-tokens-transfer-pending",
  PROPERTY_TOKENS_TRANSFERRED_AND_ORDER_SUCCESSFULLY_COMPLETED = "property-tokens-transferred-and-order-successfully-completed",
  ORDER_CANCELLED = "order-cancelled",
  ORDER_FAILED = "order-failed",
  REFUNDED = "refunded",
  ORDER_COMPLETED = "order-completed",
  SECURITY_TOKEN_TRANSFER_PENDING = "security-token-transfer-pending",
  SECURITY_TOKEN_TRANSFERRED_AND_ORDER_SUCCESSFULLY_COMPLETED = "security-token-transferred-and-order-sucessfully-completed"
}

export enum EPaymentType {
  FULL_PAYMENT = "full-payment",
}

export interface IOrderBreakup {
  name: string;
  value: number;
  percentage: number | null;
  isPercentage: boolean;
}

export interface IOrderTrackingObject {
  title: string;
  description: string;
  status: EOrderTrackingStatus;
  isCompleted: boolean;
  comingOrder: number;
  completedAt: Date | null;
  dueDate: Date | null;
}

export interface IOrder {
  assetId: Schema.Types.ObjectId;
  investorId: Schema.Types.ObjectId;
  companyId: Schema.Types.ObjectId;
  tokensBooked: number;
  blockchainOrderId?: number;
  totalFeePaid: number;
  currency: Currency;
  transactionHash?: string;
  blockNumber?: number;
  breakup: IOrderBreakup[];
  ownershipPercentage: number;
  totalOrderValue: number;
  paymentType: EPaymentType; // eoi-payment
  hasFullPaymentDone: boolean; // flag to check if full payment is done
  currentStatus: EOrderTrackingStatus;
  tracking: IOrderTrackingObject[];
  createdAt: Date;
  updatedAt: Date;
  documents: Schema.Types.ObjectId[];
  signDocumentWithSlug: Schema.Types.ObjectId[];
  transaction?: any;
}
