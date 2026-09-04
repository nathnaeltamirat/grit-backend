import z from 'zod';

export const specificFrictionInsightSchema = z.object({
  friction_id: z.array(z.string().trim()).min(1, 'Friction not chosen'),
  customInstraction: z.string().optional(),
  modelName:z.string().optional()
});
