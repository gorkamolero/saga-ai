import { z } from 'zod';
// import { v4 as uuid } from "uuid";

import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { writers } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { v4 } from 'uuid';

export const writerRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const getwriters = await ctx.db.query.writers.findMany({
      where: eq(writers.userId, ctx.user.id),
    });
    return getwriters;
  }),

  get: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input?.id) throw new Error('No id provided');
      const writer = await ctx.db.query.writers.findFirst({
        where: eq(writers.id, input.id),
      });
      return writer;
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
      const createwriter = await ctx.db
        .insert(writers)
        .values({
          id: input.id,
          userId: ctx.user.id,
          style: input.style,
        })
        .onConflictDoUpdate({
          target: [writers.id],
          set: {
            style: input.style,
          },
        })
        .returning();
      return createwriter[0];
    }),
});
