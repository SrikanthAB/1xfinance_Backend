import { AssetClass, AssetCategory } from "../asset/asset.types";

export interface IGlobalRiskFactor {
  assetClass: AssetClass;
  assetCategory: AssetCategory;
  name: string;
  description: string;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 