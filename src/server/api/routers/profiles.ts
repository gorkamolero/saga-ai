import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const profileRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        bio: z.string(),
        x_profile: z.string(),
        website: z.union([z.literal(""), z.string().trim().url()]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.insert(users).values({
        id: ctx.user.id,
        firstName: input.firstName,
        lastName: input.lastName,
        bio: input.bio,
        x_profile: input.x_profile,
        website: input.website,
      });

      return user;
    }),

  getCurrent: privateProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });
    return profile;
  }),
});
