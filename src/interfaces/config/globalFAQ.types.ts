import { AssetCategory, AssetClass } from "../asset/asset.types";

export interface IGlobalFAQ {
  assetClass: AssetClass;
  assetCategory: AssetCategory;
  question: string;
  answer: string;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 