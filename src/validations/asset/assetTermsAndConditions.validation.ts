import { z } from 'zod';

// ID validation for route parameters
export const IdValidation = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
})

// Base Terms and Conditions schema for reuse
const termsAndConditionsBaseSchema = {
  title: z
    .string()
    .min(1, "Text is required")
    .trim(),
  description: z
    .string()
    .min(1, "Description is required")
    .trim()
};

// Create Terms and Conditions validation
export const CreateTermsAndConditionsValidation = z.object({
  ...termsAndConditionsBaseSchema
}).strict();

// Update Terms and Conditions validation
export const UpdateTermsAndConditionsValidation = z.object({
  ...termsAndConditionsBaseSchema
}).partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided for update",
    path: [],
  }
);

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Terms and Conditions ID validation schema
export const TermsAndConditionsIdValidation = z.object({
  termsId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid terms and conditions ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict(); 