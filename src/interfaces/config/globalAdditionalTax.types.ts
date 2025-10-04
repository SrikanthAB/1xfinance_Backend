import { AssetClass, AssetCategory } from "../asset/asset.types";

export interface IGlobalAdditionalTax {
  assetClass: AssetClass;
  assetCategory: AssetCategory;
  name: string;
  value: number;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 