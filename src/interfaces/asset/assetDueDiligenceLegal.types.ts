// Interface for Asset Due Diligence Legal
export interface IAssetDueDiligenceLegal {
  assetId: string; // This will be ObjectId from MongoDB
  name: string;
  logoUrl: string;
  location: string;
  link: string;
  createdAt?: Date;
  updatedAt?: Date;
} 