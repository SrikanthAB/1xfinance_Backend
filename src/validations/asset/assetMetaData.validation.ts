import { z } from 'zod';

const propertyEntityBaseSchema = z.object({
    assetId: z
        .string()
        .min(1, "AssetId is required")
        .trim(),
    name: z
        .string()
        .min(1, "Name is required")
        .trim(),
    description: z
        .string()
        .min(1, "Description is required")
        .trim(),
    
});

const createPropertyEntitySchema = propertyEntityBaseSchema;

const updatePropertyEntitySchema = propertyEntityBaseSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided for update",
        path: [],
    }
);

// ID validation for route parameters
export const IdValidation = z.object({
    id: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
}).strict();

export { createPropertyEntitySchema, updatePropertyEntitySchema };

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();
