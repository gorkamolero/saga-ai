import { z } from 'zod';
// import { v4 as uuid } from "uuid";

import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { writers } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { v4 } from 'uuid';

export const writerRouter = createTRPCRouter({
  getWriters: privateProcedure.query(async ({ ctx }) => {
    const getwriters = await ctx.db.query.writers.findMany({
      where: eq(writers.userId, ctx.user.id),
    });
    return getwriters;
  }),

  createWriter: privateProcedure
    .input(
      z.object({
        style: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const createwriter = await ctx.db.insert(writers).values({
        id: v4(),
        userId: ctx.user.id,
        style: input.style,
      });
      return createwriter;
    }),
});
