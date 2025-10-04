import { z } from "zod";
import { AssetClass, AssetCategory } from "../interfaces/asset/asset.types";

const GlobalFAQValidationSchema = z.object({
  assetClass: z.enum(Object.values(AssetClass) as [string, ...string[]], {
    errorMap: () => ({ message: `Asset class must be one of: ${Object.values(AssetClass).join(", ")}` })
  }),
  assetCategory: z.enum(Object.values(AssetCategory) as [string, ...string[]], {
    errorMap: () => ({ message: `Asset category must be one of: ${Object.values(AssetCategory).join(", ")}` })
  }),
  question: z.string()
    .min(1, "Question is required")
    .max(500, "Question must be less than 500 characters")
    .trim(),
  answer: z.string()
    .min(1, "Answer is required")
    .max(2000, "Answer must be less than 2000 characters")
    .trim(),
  status: z.boolean({
    required_error: "Status field is required",
    invalid_type_error: "Status must be a boolean"
  }).default(true)
});

const CreateGlobalFAQValidation = GlobalFAQValidationSchema;
const UpdateGlobalFAQValidation = GlobalFAQValidationSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update', path: [] }
);

export { CreateGlobalFAQValidation, UpdateGlobalFAQValidation }; 