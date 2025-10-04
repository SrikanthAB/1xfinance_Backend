import { z } from "zod";
import { AssetClass, AssetCategory } from "../interfaces/asset/asset.types";
import { FeeType } from "../interfaces/config/globalFeeConfig.types";

const GlobalFeeConfigValidationSchema = z.object({
  assetClass: z.enum(Object.values(AssetClass) as [string, ...string[]], {
    errorMap: () => ({ message: `Asset class must be one of: ${Object.values(AssetClass).join(", ")}` })
  }),
  assetCategory: z.enum(Object.values(AssetCategory) as [string, ...string[]], {
    errorMap: () => ({ message: `Asset category must be one of: ${Object.values(AssetCategory).join(", ")}` })
  }),
  feeType: z.enum(Object.values(FeeType) as [string, ...string[]], {
    errorMap: () => ({ message: `Fee type must be one of: ${Object.values(FeeType).join(", ")}` })
  }),
  name: z.string()
    .min(1, "Fee name is required")
    .max(100, "Fee name must be less than 100 characters")
    .trim(),
  value: z.number()
    .min(0, "Fee value must be a positive number"),
  isPercentage: z.boolean({
    required_error: "isPercentage field is required",
    invalid_type_error: "isPercentage must be a boolean"
  }),
  status: z.boolean({
    required_error: "Status field is required",
    invalid_type_error: "Status must be a boolean"
  })
});

const CreateGlobalFeeConfigValidation = GlobalFeeConfigValidationSchema;
const UpdateGlobalFeeConfigValidation = GlobalFeeConfigValidationSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update', path: [] }
);

export { CreateGlobalFeeConfigValidation, UpdateGlobalFeeConfigValidation };