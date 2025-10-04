// src/validations/asset/rentalDistribution.validation.ts
import { z } from "zod";

export const ExpenseItemSchema = z.object({
  label: z.string().min(1),
  amount: z.number().nonnegative(),
  code: z.string().optional(),
});

export const CreateRentalDistributionSchema = z.object({
  distributionMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM"),
  distributionNotes: z.string().optional(),
});

export const UpdateRentalDistributionSchema = z.object({
  distributionMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  distributionNotes: z.string().optional(),
  status: z.enum(["draft", "ready", "distributed", "cancelled"]).optional(),
});

export const RentalDistributionIdParamSchema = z.object({
  distributionId: z.string().min(1),
});

export const AssetIdQuerySchema = z.object({
  assetId: z.string().min(1),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(), //
  year: z.string().regex(/^\d{4}$/).optional(),
});

export const MonthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
});

export const InvestorPaymentUpdateSchema = z.object({
  paymentStatus: z.enum(["pending", "paid", "failed", "cancelled"]),
  paymentMethod: z.enum(["crypto", "fiat", "wallet"]).optional(),
  paymentTransactionId: z.string().optional(),
  paymentAmount: z.number().nonnegative().optional(),
  paymentCurrency: z.string().optional(),
  paymentNotes: z.string().optional(),
});

export const ProcessDistributionSchema = z.object({
  forceProcess: z.boolean().optional(),
  creditWallets: z.boolean().optional(), // optional ledger credit
});

export const BulkUpdateInvestorPaymentSchema = z.object({
  paymentIds: z.array(z.string().min(1)),
  updateData: InvestorPaymentUpdateSchema,
});
