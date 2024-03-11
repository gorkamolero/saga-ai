import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { conversations, users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

const conversationSchema = createInsertSchema(conversations).partial();

export const conversationRouter = createTRPCRouter({
  get: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input || !input?.id) throw new Error('No id provided');
      const conversation = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, input.id),
      });
      return conversation;
    }),

  set: privateProcedure
    .input(
      z.object({
        ...conversationSchema.shape,
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input || !input?.id) throw new Error('No id provided');
      const id = input.id;
      const conversation = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, id),
      });

      if (!!conversation) {
        const updatedconversations = await ctx.db
          .update(conversations)
          .set({ ...input })
          .where(eq(conversations.id, input.id))
          .returning();

        return updatedconversations[0];
      }
      const createconversation = await ctx.db
        .insert(conversations)
        .values({
          ...input,
          id: input.id,
        })
        .returning();
      return createconversation[0];
    }),

  create: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input) throw new Error('No idea id provided');
      const createconversation = await ctx.db
        .insert(conversations)
        .values({
          userId: ctx.user.id,
          id: input.id,
        })
        .returning();
      return createconversation[0];
    }),

  createAndSetInUser: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input) throw new Error('No idea id provided');
      const createconversation = await ctx.db
        .insert(conversations)
        .values({
          userId: ctx.user.id,
          id: input.id,
        })
        .returning();
      await ctx.db
        .update(users)
        .set({ currentConversationId: input.id })
        .where(eq(users.id, ctx.user.id));
      return createconversation[0];
    }),

  recall: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input || !input?.id) throw new Error('No id provided');
      const conversation = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, input.id),
        with: {
          idea: true,
          writer: true,
          script: true,
          voiceover: true,
          video: true,
        },
      });
      return conversation;
    }),

  updateCurrent: privateProcedure
    .input(conversationSchema.partial())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (!user) throw new Error('No user found');
      if (!user.currentConversationId)
        throw new Error('No current conversation found');

      await ctx.db
        .update(conversations)
        .set(input)
        .where(eq(conversations.id, user.currentConversationId));

      return true;
    }),

  updateAiState: privateProcedure
    .input(
      z.object({
        id: z.string(),
        aiState: z.array(z.unknown()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input || !input?.id) throw new Error('No id provided');
      const id = input.id;

      const client = createClient(cookies());

      const aiStateFromInput = Array.isArray(input.aiState)
        ? input.aiState
        : [];

      const userId = ctx.user.id as string;

      const aiStateUrl = `${userId}/${id}.json`;

      const { error } = await client.storage
        .from('aiState')
        .upload(aiStateUrl, JSON.stringify(aiStateFromInput), {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;
    }),
});
