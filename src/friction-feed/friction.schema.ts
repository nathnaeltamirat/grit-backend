import z from 'zod';
import { SEVERITY } from '../generated/prisma/enums.js';

export const baseFrictionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tags: z.array(z.string().min(1, "Tag can't be empty")).optional(),
  severity: z.enum(SEVERITY, {
    message: 'Severity must be CRITICAL, MEDIUM, or LOW',
  }),
});

export const createFrictionSchema = baseFrictionSchema;
export const updateFrictionSchema = baseFrictionSchema.partial();
