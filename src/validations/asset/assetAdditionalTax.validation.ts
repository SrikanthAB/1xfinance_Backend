import { z } from 'zod';

// Base additional tax schema for reuse
const additionalTaxBaseSchema = {
  name: z.string().min(1, "Name is required").trim(),
  value: z.number().min(0, "Value must be a positive number")
};

// Create additional tax validation
export const CreateAdditionalTaxValidation = z.object({
  ...additionalTaxBaseSchema
}).strict();

// Update additional tax validation
export const UpdateAdditionalTaxValidation = z.object({
  ...additionalTaxBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Additional Tax ID validation schema
export const AdditionalTaxIdValidation = z.object({
  taxId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid tax ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();