import { z } from 'zod';

export const ideaSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Idea = z.infer<typeof ideaSchema>;
