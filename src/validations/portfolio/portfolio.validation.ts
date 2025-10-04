import { z } from "zod";

export const RentalDistributionInput = z.object({
  month: z.string().or(z.date()), // "YYYY-MM-01" or Date
  netRentalIncome: z.number().nonnegative(),
  ownershipPercentage: z.number().min(0).max(100),
});

export const UpsertAssetSchema = z.object({
  investedAmount: z.number().positive(),
  tokens: z.number().int().positive(),
  tokenPrice: z.number().positive(),
  investedDate: z.string().or(z.date()),
  rentalDistributions: z.array(RentalDistributionInput).min(1),
});