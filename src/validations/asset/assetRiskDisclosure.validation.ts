import { z } from "zod";

// Base risk disclosure schema for reuse
const riskDisclosureBaseSchema = {
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().min(1, "Description is required").trim()
};

// Create risk disclosure validation
export const CreateRiskDisclosureValidation = z.object({
  ...riskDisclosureBaseSchema
}).strict();

// Update risk disclosure validation
export const UpdateRiskDisclosureValidation = z.object({
  ...riskDisclosureBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Risk Disclosure ID validation schema
export const RiskDisclosureIdValidation = z.object({
  riskDisclosureId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid risk disclosure ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict(); 