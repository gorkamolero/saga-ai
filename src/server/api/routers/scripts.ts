import { z } from 'zod';
// import { v4 as uuid } from "uuid";

import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { conversations, scripts, users } from '@/server/db/schema';
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

      const userId = ctx.user.id as string;
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      const currentConversationId = user?.currentConversationId;
      if (!currentConversationId) throw new Error('User has no conversation');
      const conversation = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, currentConversationId),
      });
      const ideaId = conversation?.ideaId || conversation?.id;
      if (!ideaId) throw new Error('Idea not found');

      const writerId = conversation?.writerId || conversation?.id;
      if (!writerId) throw new Error('Writer not found');

      const createscript = await ctx.db
        .insert(scripts)
        .values({
          id: input.id,
          content,
          wordCount,
          userId: ctx.user.id,
          ideaId,
          writerId,
        })
        .returning();

      await ctx.db
        .update(conversations)
        .set({ scriptId: input.id })
        .where(eq(conversations.id, currentConversationId));
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
