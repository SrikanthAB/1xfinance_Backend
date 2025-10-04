import { z } from 'zod';

// Base FAQ schema for reuse
const faqBaseSchema = {
  question: z.string().min(1, "Question is required").trim(),
  answer: z.string().min(1, "Answer is required").trim()
};

// Create FAQ validation
export const CreateFaqValidation = z.object({
  ...faqBaseSchema
}).strict();

// Update FAQ validation
export const UpdateFaqValidation = z.object({
  ...faqBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// FAQ ID validation schema
export const FaqIdValidation = z.object({
  faqId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid FAQ ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();
