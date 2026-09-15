import z from 'zod';

export const specificFrictionInsightSchema = z.object({
  friction_id: z.array(z.string().trim()).min(1, 'Friction not chosen'),
  customInstraction: z.string().optional(),
  modelName: z.enum(
    ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b'],
    {
      error: 'model name not recognized',
    },
  ),
});
export const timeRangeFrictionInsightSchema = z.object({
  start: z.coerce.date({ error: 'Start date is required' }),
  end: z.coerce.date({ error: 'End date is required' }),
  customInstraction: z.string().optional(),
  modelName: z.enum(
    ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b'],
    {
      error: 'model name not recognized',
    },
  ),
});
