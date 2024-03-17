import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { channels } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { v4 } from 'uuid';

export const channelRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const getchannels = await ctx.db.query.channels.findMany({
      where: eq(channels.userId, ctx.user.id),
    });
    return getchannels;
  }),

  get: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input?.id) throw new Error('No id provided');
      const channel = await ctx.db.query.channels.findFirst({
        where: eq(channels.id, input.id),
      });
      return channel;
    }),

  create: privateProcedure
    .input(
      z.object({
        conversationId: z.string(),
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = v4();
      const conversationId = input.conversationId;
      const name = input.name;
      const description = input.description;

      const createchannel = await ctx.db
        .insert(channels)
        .values({
          id,
          name,
          description,
          userId: ctx.user.id,
          conversationId,
          artistId: conversationId,
          writerId: conversationId,
        })
        .onConflictDoUpdate({
          target: [channels.id],
          set: {
            name,
            description,
          },
        })
        .returning();

      return createchannel[0];
    }),
});
