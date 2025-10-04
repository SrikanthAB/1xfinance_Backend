import { z } from 'zod';
import { Types } from 'mongoose';
import {LocationType} from '../../config/constants/enums';

const NearByLocationValidationSchema = z.object({
  propertyId: z
    .string()
    .min(1, { message: 'Property ID is required' })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid propertyId, must be a valid ObjectId',
    }),
  locationType: z
    .enum(Object.values(LocationType) as [LocationType, ...LocationType[]], {
      message: `Location type must be one of: ${Object.values(LocationType).join(', ')}`,
    }),
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be less than 100 characters' })
    .trim(),
  location: z
    .string()
    .min(1, { message: 'Location is required' })
    .max(255, { message: 'Location must be less than 255 characters' })
    .trim(),
  distance: z
    .number({ message: 'Distance must be a number' })
    .min(0, { message: 'Distance must be a non-negative number' }),
  isActive: z
    .boolean({ message: 'isActive must be a boolean' })
    .default(false),
});

const CreateNearByLocationValidation = z.array(NearByLocationValidationSchema);

// Validation for updating isActive field only.
const UpdateIsActiveValidation = z.object({
  isActive: z.boolean({ message: 'isActive must be a boolean' }),
});

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// ID validation for route parameters
export const IdValidation = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
}).strict();

export {CreateNearByLocationValidation,UpdateIsActiveValidation};