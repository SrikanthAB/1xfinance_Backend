import { z } from 'zod';

const objectIdRegex = /^[a-f\d]{24}$/i;

export const createWalletValidation = z.object({
  address: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{64}$/, {
      message: "Address must be a valid 64-character lowercase hexadecimal string",
    }),

  balance: z
    .number()
    .nonnegative({ message: "Balance cannot be negative" })
    .optional(),

  status: z
    .boolean()
    .optional(),
});
