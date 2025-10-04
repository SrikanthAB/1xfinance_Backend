import { z } from 'zod';

export const createTableConfigSchema = z.object({
  tableKey: z.string().min(1, "tableKey is required"),
  config: z.record(z.any()).optional(), // any JSON object
});

export const updateTableConfigSchema = z.object({
  tableKey: z.string().min(1).optional(),
  config: z.record(z.any()).optional(),
});

export const paramsWithIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
});