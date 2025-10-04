import { z } from "zod";
import { AssetClass, AssetCategory } from "../interfaces/asset/asset.types";

const GlobalRiskFactorValidationSchema = z.object({
  assetClass: z.enum(Object.values(AssetClass) as [string, ...string[]], {
    errorMap: () => ({ message: `Asset class must be one of: ${Object.values(AssetClass).join(", ")}` })
  }),
  assetCategory: z.enum(Object.values(AssetCategory) as [string, ...string[]], {
    errorMap: () => ({ message: `Asset category must be one of: ${Object.values(AssetCategory).join(", ")}` })
  }),
  name: z.string()
    .min(1, "Name is required")
    .max(200, "Name must be less than 200 characters")
    .trim(),
  description: z.string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters")
    .trim(),
  status: z.boolean({
    required_error: "Status field is required",
    invalid_type_error: "Status must be a boolean"
  }).default(true)
});

const CreateGlobalRiskFactorValidation = GlobalRiskFactorValidationSchema;
const UpdateGlobalRiskFactorValidation = GlobalRiskFactorValidationSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update', path: [] }
);

export { CreateGlobalRiskFactorValidation, UpdateGlobalRiskFactorValidation }; 