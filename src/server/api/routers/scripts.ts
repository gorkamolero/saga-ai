import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { conversations, scripts, users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { type Script } from '@/lib/validators/scripts';
import { type Idea } from '@/lib/validators';

const updateScriptSchema = z.object({
  id: z.string(),
  script: z.string(),
});

export const scriptRouter = createTRPCRouter({
  get: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const getScript = await ctx.db.query.scripts.findFirst({
        where: eq(scripts.id, input.id),
      });
      return getScript;
    }),
  getAll: privateProcedure.query(async ({ ctx }) => {
    const getScripts = await ctx.db.query.scripts.findMany({
      where: eq(scripts.userId, ctx.user.id),
      with: {
        idea: true,
      },
    });
    return getScripts as (Script & {
      idea: Idea;
    })[];
  }),
  create: privateProcedure
    .input(
      z.object({
        id: z.string(),
        script: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const content = input.script;
      const wordCount = content.split(' ').length;
      const create = await ctx.db.insert(scripts).values({
        id: input.id,
        content,
        wordCount,
        userId: ctx.user.id,
      });
      return create;
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

      const userId = ctx.user.id;
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

      const create = await ctx.db
        .insert(scripts)
        .values({
          id: input.id,
          content,
          wordCount,
          userId: ctx.user.id,
          ideaId,
          ...(conversation?.writerId && { writerId }),
        })
        .returning();

      await ctx.db
        .update(conversations)
        .set({ scriptId: input.id })
        .where(eq(conversations.id, currentConversationId));
      return create[0];
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
