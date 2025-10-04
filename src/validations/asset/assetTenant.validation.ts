import { z } from "zod";
import { TenantStatus, TenantType } from "../../interfaces/asset/assetTenant.types";

// Base tenant schema for reuse
const tenantBaseSchema = {
  name: z.string().min(1, "Tenant name is required"),
  rentPerSft: z.number().min(0, "Rent per sft must be a positive number"),
  sftsAllocated: z.number().min(0, "Sfts allocated must be a positive number"),
  annualRentEscalation: z.number().min(0, "Annual rent escalation must be a positive number"),
  startDate: z.string().datetime({ message: "Start date must be a valid ISO date" }),
  endDate: z.string().datetime({ message: "End date must be a valid ISO date" }),
  status: z.enum(Object.values(TenantStatus) as [string, ...string[]], {
    errorMap: () => ({
      message: `Status must be one of: ${Object.values(TenantStatus).join(", ")}`,
    }),
  }),
  type: z.enum(Object.values(TenantType) as [string, ...string[]], {
    errorMap: () => ({
      message: `Tenant type must be one of: ${Object.values(TenantType).join(", ")}`,
    }),
  }),
  lockInPeriod: z.number().int().min(1, "Lock-in period must be at least 1 month"),
  leasePeriod: z.number().int().min(1, "Lease period must be at least 1 month"),
  securityDeposit: z.number().min(0, "Security deposit must be a positive number"),
  interestOnSecurityDeposit: z.number().min(0, "Interest on security deposit must be a positive number"),
  agreement: z.string().optional().nullable(),
  logo: z.string().optional().nullable()
};
// Create tenant validation
export const CreateAssetTenantValidation = z.object({
  ...tenantBaseSchema
}).strict();

// Update tenant validation
export const UpdateAssetTenantValidation = z.object({
  ...tenantBaseSchema
}).partial().strict();

// Asset ID validation schema
export const AssetIdValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict();

// Tenant ID validation schema
export const TenantIdValidation = z.object({
  tenantId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid tenant ID format")
}).strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z.object({
  assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format")
}).strict(); 