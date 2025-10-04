import { z } from "zod";

// Base risk factor schema for reuse
const riskFactorBaseSchema = {
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().min(1, "Description is required").trim()
};

// Create risk factor validation
export const CreateRiskFactorValidation = z.object({
  ...riskFactorBaseSchema
}).strict();

// Update risk factor validation
export const UpdateRiskFactorValidation = z.object({
  ...riskFactorBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Risk Factor ID validation schema
export const RiskFactorIdValidation = z.object({
  riskFactorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid risk factor ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict(); 