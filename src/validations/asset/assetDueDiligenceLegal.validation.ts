import { z } from "zod";

// Base due diligence legal schema for reuse
const dueDiligenceLegalBaseSchema = {
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  logoUrl: z.string().min(1, "Logo URL is required").url("Invalid URL format"),
  location: z.string().min(1, "Location is required"),
  link: z.string().min(1, "Link is required").url("Invalid URL format")
};

// Create due diligence legal validation
export const CreateAssetDueDiligenceLegalValidation = z.object({
  ...dueDiligenceLegalBaseSchema
}).strict();

// Update due diligence legal validation
export const UpdateAssetDueDiligenceLegalValidation = z.object({
  ...dueDiligenceLegalBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Due Diligence Legal ID validation schema
export const DueDiligenceLegalIdValidation = z.object({
  dueDiligenceLegalId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid due diligence legal ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict(); 