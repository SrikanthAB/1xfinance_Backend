import { z } from 'zod';
import { AssetCategory, AssetClass } from '../interfaces/asset/asset.types';

const urlRegex = new RegExp(
  /^(https?:\/\/(?:www\.)?[^\s/$.?#].[^\s]*)$/i
);

const globalAmenityFeatureBaseSchema = z.object({
    assetCategory: z.nativeEnum(AssetCategory, {
        errorMap: () => ({ message: "Asset category is required and must be a valid value" }),
    }),
    assetClass: z.nativeEnum(AssetClass, {
        errorMap: () => ({ message: "Asset class is required and must be a valid value" }),
    }).default(AssetClass.REAL_ESTATE),
    name: z
        .string()
        .min(1, "Name is required")
        .trim(),
    description: z
        .string()
        .min(1, "Description is required")
        .trim(),
    image: z
        .string()
        .min(1, "Image URL is required")
        .regex(urlRegex, { message: "Image must be a valid URL" })
        .trim(),
    status: z.boolean().optional(),
});

const createAmenityFeatureSchema = globalAmenityFeatureBaseSchema;

const updateAmenityFeatureSchema = globalAmenityFeatureBaseSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided for update",
        path: [],
    }
);

export { createAmenityFeatureSchema, updateAmenityFeatureSchema };
