import { z } from 'zod';

// Base amenity/feature schema for reuse
const amenityFeatureBaseSchema = {
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().min(1, "Description is required").trim().optional(),
  image: z.string().url("Image must be a valid URL"),
  status: z.boolean().optional()
};

// Create amenity/feature validation
export const createAmenityFeatureSchema = z.object({
  ...amenityFeatureBaseSchema
}).strict();

// Update amenity/feature validation
export const updateAmenityFeatureSchema = z.object({
  ...amenityFeatureBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Amenity/Feature ID validation schema
export const AmenityFeatureIdValidation = z.object({
  amenityId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid amenity ID format")
}).strict();

export const FeatureIdValidation = z.object({
  featureId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid feature ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();