import { z } from "zod";

// Base due diligence valuation schema for reuse
const dueDiligenceValuationBaseSchema = {
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  logoUrl: z.string().min(1, "Logo URL is required").url("Invalid URL format"),
  location: z.string().min(1, "Location is required"),
  link: z.string().min(1, "Link is required").url("Invalid URL format")
};

// Create due diligence valuation validation
export const CreateAssetDueDiligenceValuationValidation = z.object({
  ...dueDiligenceValuationBaseSchema
}).strict();

// Update due diligence valuation validation
export const UpdateAssetDueDiligenceValuationValidation = z.object({
  ...dueDiligenceValuationBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Due Diligence Valuation ID validation schema
export const DueDiligenceValuationIdValidation = z.object({
  dueDiligenceValuationId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid due diligence valuation ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict(); 