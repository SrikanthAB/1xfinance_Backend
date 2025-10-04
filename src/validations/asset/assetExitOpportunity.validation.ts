import { z } from "zod";

// Base exit opportunity schema for reuse
const exitOpportunityBaseSchema = {
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required")
};

// Create exit opportunity validation
export const CreateExitOpportunityValidation = z.object({
  ...exitOpportunityBaseSchema
}).strict();

// Update exit opportunity validation
export const UpdateExitOpportunityValidation = z.object({
  ...exitOpportunityBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Exit Opportunity ID validation schema
export const ExitOpportunityIdValidation = z.object({
  exitOpportunityId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid exit opportunity ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict(); 