import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import {
  ideas,
  scripts,
  users,
  videos,
  voiceovers,
  writers,
} from '@/server/db/schema';
import { count, eq } from 'drizzle-orm';
import { profileSchema } from '@/lib/validators/profile';

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

    const writersCount = await ctx.db
      .select({
        value: count(),
      })
      .from(writers)
      .where(eq(writers.userId, ctx.user.id));

    const scriptsCount = await ctx.db
      .select({
        value: count(),
      })
      .from(scripts)
      .where(eq(scripts.userId, ctx.user.id));

    const voiceoversCount = await ctx.db
      .select({
        value: count(),
      })
      .from(voiceovers)
      .where(eq(voiceovers.userId, ctx.user.id));

    const videosCount = await ctx.db
      .select({
        value: count(),
      })
      .from(videos)
      .where(eq(videos.userId, ctx.user.id));

    return {
      ...user,
      ...(ideasCount[0] && { ideasCount: ideasCount[0].value }),
      ...(writersCount[0] && { writersCount: writersCount[0].value }),
      ...(scriptsCount[0] && { scriptsCount: scriptsCount[0].value }),
      ...(voiceoversCount[0] && { voiceoversCount: voiceoversCount[0].value }),
      ...(videosCount[0] && { videosCount: videosCount[0].value }),
    };
  }),
});
