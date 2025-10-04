import { z } from "zod";

// Base due diligence structure schema for reuse
const dueDiligenceStructureBaseSchema = {
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  logoUrl: z.string().min(1, "Logo URL is required").url("Invalid URL format"),
  location: z.string().min(1, "Location is required"),
  link: z.string().min(1, "Link is required").url("Invalid URL format")
};

// Create due diligence structure validation
export const CreateAssetDueDiligenceStructureValidation = z.object({
  ...dueDiligenceStructureBaseSchema
}).strict();

// Update due diligence structure validation
export const UpdateAssetDueDiligenceStructureValidation = z.object({
  ...dueDiligenceStructureBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Due Diligence Structure ID validation schema
export const DueDiligenceStructureIdValidation = z.object({
  dueDiligenceStructureId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid due diligence structure ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict(); 