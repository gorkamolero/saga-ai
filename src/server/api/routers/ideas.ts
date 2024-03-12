import { z } from 'zod';
// import { v4 as uuid } from "uuid";

import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { ideas } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { v4 } from 'uuid';
import { Idea } from '@/lib/validators';

export const ideaRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const getideas = await ctx.db.query.ideas.findMany({
      where: eq(ideas.userId, ctx.user.id),
    });
    return getideas as Idea[];
  }),

  createIdea: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(ideas).values({
        id: input.id,
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        createdAt: new Date(),
      });

      return {
        title: input.title,
        description: input.description,
      };
    }),

  createIdeaFromDescription: privateProcedure
    .input(
      z.object({
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = v4();

      await ctx.db.insert(ideas).values({
        id,
        userId: ctx.user.id,
        description: input.description,
      });

      return {
        description: input.description,
        id,
      };
    }),

  createIdeaWithTitleAndDescription: privateProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = v4();

      await ctx.db.insert(ideas).values({
        id,
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        createdAt: new Date(),
      });

      return {
        title: input.title,
        description: input.description,
        id,
      };
    }),
});
