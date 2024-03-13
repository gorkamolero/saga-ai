import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { artists } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const artistRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const getartists = await ctx.db.query.artists.findMany({
      where: eq(artists.userId, ctx.user.id),
    });
    return getartists;
  }),

  get: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input?.id) throw new Error('No id provided');
      const artist = await ctx.db.query.artists.findFirst({
        where: eq(artists.id, input.id),
      });
      return artist;
    }),

  create: privateProcedure
    .input(
      z.object({
        id: z.string(),
        style: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input?.id) throw new Error('No id provided');
      const createartist = await ctx.db
        .insert(artists)
        .values({
          id: input.id,
          userId: ctx.user.id,
          style: input.style,
        })
        .onConflictDoUpdate({
          target: [artists.id],
          set: {
            style: input.style,
          },
        })
        .returning();
      return createartist[0];
    }),
});
