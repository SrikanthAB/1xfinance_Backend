import { z } from "zod";
import { FeeType } from "../../interfaces/asset/assetFeeConfig.types";

// Base fee config schema for reuse
const feeConfigBaseSchema = {
  type: z.enum(Object.values(FeeType).filter(value => typeof value === 'string') as [string, ...string[]], {
    errorMap: () => ({ message: `Fee type must be one of: ${Object.values(FeeType).join(", ")}` })
  }),
  name: z.string().min(1, "Fee name is required").max(100, "Fee name must be less than 100 characters").trim(),
  value: z.number().min(0, "Fee value must be a positive number"),
  isPercentage: z.boolean(),
  status: z.boolean()
};

// Create fee config validation
export const CreateAssetFeeConfigValidation = z.object({
  ...feeConfigBaseSchema
}).strict();

// Update fee config validation
export const UpdateAssetFeeConfigValidation = z.object({
  ...feeConfigBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Fee Config ID validation schema
export const FeeConfigIdValidation = z.object({
  feeConfigId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid fee config ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// ID validation for legacy routes (to be updated)
export const IdValidation = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
}).strict(); 