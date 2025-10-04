// Enum for Fee Types
export enum FeeType {
  REGISTRATION = "registration",
  LEGAL = "legal",
  PLATFORM = "platform",
  BROKERAGE = "brokerage",
  RESERVES = "reserves"
}

// Interface for Asset Fee Config
export interface IAssetFeeConfig {
  assetId: string; // This will be ObjectId from MongoDB
  type: FeeType;
  name: string;
  value: number;
  isPercentage: boolean;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 
export const STATIC_RESERVE_FEE_CONFIG: Omit<IAssetFeeConfig, "assetId"> = {
  type: FeeType.RESERVES,
  name: "Reserve Fee",
  value: 1,
  isPercentage: true,
  status: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
