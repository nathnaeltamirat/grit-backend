import z from 'zod';

export const updateAPIKeySchema = z.object({
  ai_api_key: z.string(),
});
