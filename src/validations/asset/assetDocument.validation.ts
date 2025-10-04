import { z } from "zod";
import { EAssetDocumentType, EAssetDocumentFormat } from "../../interfaces/asset/assetDocument.types";

// Base document schema for reuse
const documentBaseSchema = {
  name: z.string().min(1, "Document name is required").max(100, "Document name must be less than 100 characters"),
  type: z.enum(Object.values(EAssetDocumentType) as [string, ...string[]], {
    errorMap: () => ({
      message: `Document type must be one of: ${Object.values(EAssetDocumentType).join(", ")}`,
    }),
  }),
  description:z.string().min(1, "Document name is required"),
  format: z.string().optional().nullable(),
  document:z.object({
      name: z.string().min(1, { message: 'Bank statement name is required' }),
      url: z.string().url({ message: 'Bank statement must be a valid URL' })
    }),
  isProtected: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true)
};

// Create document validation
export const CreateAssetDocumentValidation = z.object({
  ...documentBaseSchema
}).strict();

// Update document validation
export const UpdateAssetDocumentValidation = z.object({
  ...documentBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Document ID validation schema
export const DocumentIdValidation = z.object({
  documentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid document ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict(); 