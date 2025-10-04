// Enums for GlobalFeeConfig properties

import {AssetCategory, AssetClass} from "../asset/asset.types";

export enum FeeType {
  REGISTRATION = "registration",
  LEGAL = "legal"
}

export interface IGlobalFeeConfig {
  assetClass: AssetClass;
  assetCategory: AssetCategory;
  feeType: FeeType;
  name: string;
  value: number;
  isPercentage: boolean;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 