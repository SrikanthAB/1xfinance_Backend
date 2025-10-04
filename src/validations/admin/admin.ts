import { z } from 'zod';

const tokenSchema = z
  .string()
  .min(1, { message: 'Token is required' })
  .regex(/^eyJ/, { message: 'Invalid token format' });

export const tokenResponseSchema = z.object({
  accessToken: tokenSchema,
  refreshToken: tokenSchema,
});
