import { Schema } from "mongoose";

export interface IAdditionalTax {
  assetId: Schema.Types.ObjectId;
  name: string;
  value: number;
  createdAt?: Date;
  updatedAt?: Date;
} 