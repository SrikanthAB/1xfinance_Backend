import { z } from "zod";
import mongoose from "mongoose";

const BookmarkQueryValidation = z.object({
  assetId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid assetId format in bookmark",
    }),
});

const getAllBookmarkQuery = z.object({
  page: z
    .string()
    .optional()
    .refine((val) => val === undefined || (/^\d+$/.test(val) && Number(val) > 0), {
      message: "Page must be a positive integer",
    }),
  limit: z
    .string()
    .optional()
    .refine((val) => val === undefined || (/^\d+$/.test(val) && Number(val) > 0), {
      message: "Limit must be a positive integer",
    })
});

export  {BookmarkQueryValidation,getAllBookmarkQuery}