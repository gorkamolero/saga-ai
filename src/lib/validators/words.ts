import { z } from 'zod';

export const wordSchema = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
});

export type WordType = z.infer<typeof wordSchema>;
