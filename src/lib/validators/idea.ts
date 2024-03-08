import { z } from "zod";

export const ideaSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
