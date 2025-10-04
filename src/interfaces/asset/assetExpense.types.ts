// Interface for Asset Expense
export interface IAssetExpense {
  assetId: string; // This will be ObjectId from MongoDB
  name: string;
  isPercentage: boolean;
  value: number;
  status: boolean;
} 