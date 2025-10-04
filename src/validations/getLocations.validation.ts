import { z } from 'zod';

export const getLocationsQuerySchema = z
  .object({
    country: z
      .string()
      .optional()
      .default('')
      .refine(val => val === '' || /^[A-Z0-9]+$/.test(val), {
        message: 'countryCode must contain only uppercase letters (A-Z) or numbers',
      }),

    state: z
      .string()
      .optional()
      .default('')
      .refine(val => val === '' || /^[A-Z0-9]+$/.test(val), {
        message: 'stateCode must contain only uppercase letters (A-Z) or numbers',
      }),
  })
  .superRefine((data, ctx) => {
    if (data.state && !data.country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['country'],
        message: 'countryCode is required when stateCode is provided',
      });
    }
  });
