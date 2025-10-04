// Interface for Asset Due Diligence Valuation
export interface IAssetDueDiligenceValuation {
  assetId: string; // This will be ObjectId from MongoDB
  name: string;
  logoUrl: string;
  location: string;
  link: string;
  createdAt?: Date;
  updatedAt?: Date;
} 