import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { ideas, users } from "@/server/db/schema";
import { count, eq } from "drizzle-orm";
import { profileSchema } from "@/lib/validators/profile";

export type ProfileInput = z.infer<typeof profileSchema>;

export const userRouter = createTRPCRouter({
  get: privateProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });
    return profile;
  }),
  createProfile: privateProcedure
    .input(profileSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData: Partial<ProfileInput> = {};

      if (input.firstName) {
        updateData.firstName = input.firstName;
      }
      if (input.lastName) {
        updateData.lastName = input.lastName;
      }
      if (input.bio) {
        updateData.bio = input.bio;
      }
      if (input.x_handle) {
        updateData.x_handle = input.x_handle;
      }
      if (input.website) {
        updateData.website = input.website;
      }

      const user = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id));

      return user;
    }),
  getFullUser: privateProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
      with: {
        ideas: true,
      },
    });

    return user;
  }),

  getUserWithInnerCount: privateProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    const ideasCount = await ctx.db
      .select({
        value: count(),
      })
      .from(ideas)
      .where(eq(ideas.userId, ctx.user.id));

    if (!ideasCount[0]) {
      return {
        ...user,
        ideasCount: 0,
      };
    }

    return {
      ...user,
      ideasCount: ideasCount[0].value,
    };
  }),
});
