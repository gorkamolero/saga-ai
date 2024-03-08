import { z } from "zod";
import { ideaSchema } from "./idea";

export const fullUserSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z
    .string()
    .optional()
    .refine((val) => !val || val?.length >= 10, {
      message: "Bio must contain at least 10 characters",
    }),
  x_handle: z
    .string()
    .optional()
    .refine((val) => !val || val?.length >= 3, {
      message: "X Profile must contain at least 3 characters",
    }),
  website: z.union([z.literal(""), z.string().trim().url()]).optional(),
  ideas: z.array(ideaSchema),
});

export type UserType = z.infer<typeof fullUserSchema>;
