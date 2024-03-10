import { z } from 'zod';
// import { v4 as uuid } from "uuid";

import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { scripts } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

const updateScriptSchema = z.object({
  id: z.string(),
  script: z.string(),
});

export const scriptRouter = createTRPCRouter({
  createScript: privateProcedure
    .input(
      z.object({
        id: z.string(),
        script: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const content = input.script;
      const wordCount = content.split(' ').length;
      const createscript = await ctx.db.insert(scripts).values({
        id: input.id,
        content,
        wordCount,
        userId: ctx.user.id,
      });
      return createscript;
    }),

  createOrUpdate: privateProcedure
    .input(
      z.object({
        id: z.string(),
        script: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const content = input.script;
      const wordCount = content.split(' ').length;
      const existsScript = await ctx.db.query.scripts.findFirst({
        where: eq(scripts.id, input.id),
      });

      if (!!existsScript) {
        const updatedScript = await ctx.db
          .update(scripts)
          .set({ content: input.script })
          .where(eq(scripts.id, input.id))
          .returning();

        return updatedScript[0];
      }

      const createscript = await ctx.db
        .insert(scripts)
        .values({
          id: input.id,
          content,
          wordCount,
          userId: ctx.user.id,
        })
        .returning();
      return createscript[0];
    }),

  getScripts: privateProcedure.query(async ({ ctx }) => {
    const getscripts = await ctx.db.query.scripts.findMany({
      where: eq(scripts.userId, ctx.user.id),
    });
    return getscripts;
  }),

  saveScript: privateProcedure
    .input(updateScriptSchema)
    .mutation(async ({ input, ctx }) => {
      const updatedScript = await ctx.db
        .update(scripts)
        .set({ content: input.script })
        .where(eq(scripts.id, input.id));

      return updatedScript;
    }),
});
