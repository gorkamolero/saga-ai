import { z } from "zod";

export const profileSchema = z.object({
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
});
