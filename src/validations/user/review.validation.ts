import {z} from "zod"
import mongoose, { mongo } from "mongoose"

const queryValidation = z.object({
    assetId: z
      .string({
        required_error: "Asset ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Asset ID format"),
  });

  const paramValidation = z.object({
    id: z
      .string({
        required_error: "Asset ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Asset ID format"),
  });

  const createReviewValidation = z.object({
    rating: z
      .number({
        required_error: "Rating is required",
      })
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
  
    review: z
      .string({
        required_error: "Review is required",
      })
      .min(3, "Review must be at least 3 characters")
      .max(300,"Review must be at most 300 characters")
  });

  const updateReviewValidation = createReviewValidation.partial();


  

  export {queryValidation,createReviewValidation,paramValidation,updateReviewValidation};