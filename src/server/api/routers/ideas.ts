import { z } from "zod";
// import { v4 as uuid } from "uuid";

import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { ideas } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";

export const ideaRouter = createTRPCRouter({
  getIdeas: privateProcedure.query(async ({ ctx }) => {
    const getideas = await ctx.db.query.ideas.findMany({
      where: eq(ideas.userId, ctx.user.id),
    });
    return getideas;
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
        id,
      };
    }),
});