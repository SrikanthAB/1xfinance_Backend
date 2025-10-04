import { z } from "zod";

// Base expense schema for reuse
const expenseBaseSchema = {
  name: z.string().min(1, "Expense name is required").max(100, "Expense name must be less than 100 characters"),
  isPercentage: z.boolean().optional().default(true),
  value: z.number().min(0, "Value must be a non-negative number"),
  status: z.boolean().optional().default(true)
};

// Create expense validation
export const CreateAssetExpenseValidation = z.object({
  ...expenseBaseSchema
}).strict();

// Update expense validation
export const UpdateAssetExpenseValidation = z.object({
  ...expenseBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Expense ID validation schema
export const ExpenseIdValidation = z.object({
  expenseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid expense ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict(); 