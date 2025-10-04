import { Schema } from "mongoose";

export interface IExitOpportunity {
  assetId: Schema.Types.ObjectId;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
} 