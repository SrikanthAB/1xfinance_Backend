import { z } from 'zod';
import { RentalDistributionStatus } from '../../interfaces/rental/rentalDistribution.types';

/**
 * Validation schema for creating a rental period
 */
export const createRentalPeriodValidation = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  month: z.number()
    .int('Month must be an integer')
    .min(1, 'Month must be between 1 and 12')
    .max(12, 'Month must be between 1 and 12'),
  year: z.number()
    .int('Year must be an integer')
    .min(2000, 'Year must be after 2000')
    .max(2100, 'Year must be before 2100')
});

/**
 * Validation schema for calculating distributions
 */
export const calculateDistributionsValidation = z.object({
  rentalPeriodId: z.string().min(1, 'Rental period ID is required')
});

/**
 * Validation schema for processing distributions
 */
export const processDistributionsValidation = z.object({
  rentalPeriodId: z.string().min(1, 'Rental period ID is required')
});

/**
 * Validation schema for getting rental period details
 */
export const getRentalPeriodDetailsValidation = z.object({
  rentalPeriodId: z.string().min(1, 'Rental period ID is required')
});

/**
 * Validation schema for getting rental periods by asset
 */
export const getRentalPeriodsByAssetValidation = z.object({
  assetId: z.string().min(1, 'Asset ID is required')
});

/**
 * Validation schema for getting distribution summary
 */
export const getDistributionSummaryValidation = z.object({
  rentalPeriodId: z.string().min(1, 'Rental period ID is required')
});

/**
 * Validation schema for distributing rental yields
 */
export const distributeRentalYieldsValidation = z.object({
  rentalPeriodId: z.string().min(1, 'Rental period ID is required'),
  distributionDate: z.string().datetime({
    message: 'Distribution date must be a valid ISO date string'
  })
});

/**
 * Validation schema for updating a distribution
 */
export const updateDistributionValidation = z.object({
  status: z.enum(Object.values(RentalDistributionStatus) as [string, ...string[]], {
    required_error: 'Status is required',
    invalid_type_error: `Status must be one of: ${Object.values(RentalDistributionStatus).join(', ')}`
  }),
  notes: z.string().optional()
});
