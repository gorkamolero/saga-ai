import { z } from "zod";

export const newProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  bio: z.string().min(10).max(256),
  x_profile: z.string().min(3).max(256),
  website: z.union([z.literal(""), z.string().trim().url()]),
});
