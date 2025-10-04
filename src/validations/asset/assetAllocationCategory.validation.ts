import { z } from 'zod';
import { VestingType } from '../../interfaces/asset/assetAllocationCategory.types';

// Base schema for common fields
const baseAllocationSchema = {
    category: z.string({
        required_error: 'Category is required',
        invalid_type_error: 'Category must be a string'
    }).min(1, 'Category cannot be empty'),
    
    tokens: z.number({
        required_error: 'Tokens amount is required',
        invalid_type_error: 'Tokens must be a number'
    }).min(0, 'Tokens must be greater than or equal to 0'),
    
    percentage: z.number({
        invalid_type_error: 'Percentage must be a number'
    }).min(0, 'Percentage must be greater than or equal to 0')
      .max(100, 'Percentage must be less than or equal to 100')
      .refine((val) => !Number.isNaN(val), 'Percentage must be a valid number')
      .optional(),
    
    vestingType: z.enum([VestingType.NO_VESTING, VestingType.LINEAR_VESTING, VestingType.CLIFF_VESTING], {
        required_error: 'Vesting type is required',
        invalid_type_error: 'Invalid vesting type'
    }),
    
    vestingStartDate: z.coerce.date().optional(),
    vestingEndDate: z.coerce.date().optional(),
    cliffPeriod: z.number().min(0).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional().default(true)
};

export const AssetIdQueryValidation = z.object({
    assetId: z.string({
        required_error: 'Asset ID is required',
        invalid_type_error: 'Asset ID must be a string'
    }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid asset ID format')
});

export const AllocationIdValidation = z.object({
    allocationId: z.string({
        required_error: 'Allocation ID is required',
        invalid_type_error: 'Allocation ID must be a string'
    }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid allocation ID format')
});

export const CreateAllocationCategoryValidation = z.object({
    ...baseAllocationSchema,
    percentage: z.never({
        invalid_type_error: "Percentage cannot be set directly. It is automatically calculated based on tokens."
    }).optional()
}).strict().refine(
    (data) => {
        if (data.vestingStartDate && data.vestingEndDate) {
            return data.vestingEndDate > data.vestingStartDate;
        }
        return true;
    },
    {
        message: 'Vesting end date must be after vesting start date',
        path: ['vestingEndDate']
    }
);

export const UpdateAllocationCategoryValidation = z.object({
    ...baseAllocationSchema,
    percentage: z.never({
        invalid_type_error: "Percentage cannot be updated directly. It is automatically calculated based on tokens."
    }).optional()
}).partial().refine(
    (data) => {
        if (data.vestingStartDate && data.vestingEndDate) {
            return data.vestingEndDate > data.vestingStartDate;
        }
        return true;
    },
    {
        message: 'Vesting end date must be after vesting start date',
        path: ['vestingEndDate']
    }
); 