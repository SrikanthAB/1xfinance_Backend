import { z } from 'zod';

export const aadhaarNumberSchema = z.object({
  aadhaarNumber: z
    .number({
      required_error: "aadhaarNumber is required",
      invalid_type_error: "aadhaarNumber must be a number",
    })
    .int()
    .min(100000000000, { message: "aadhaarNumber must be 12 digits" })
    .max(999999999999, { message: "aadhaarNumber must be 12 digits" }),
});


export const otpSchema = z.object({
  otp: z
    .number({
        required_error: "OTP is required",
      invalid_type_error: "OTP must be a number",
    })
    .int()
    .min(100000, { message: "OTP must be 6 digits" })
    .max(999999, { message: "OTP must be 6 digits" }),
});
