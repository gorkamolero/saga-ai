import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { conversations, scripts, users, videos } from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { v4 } from 'uuid';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import generateTranscript from '@/lib/ai/generateTranscript';
import { remapTranscript } from '@/lib/utils';
import { VOICEMODELS } from '@/lib/validators/voicemodel';
import { Transcript } from 'assemblyai';

const videoSchema = createInsertSchema(videos).partial();

export const videoRouter = createTRPCRouter({
  get: privateProcedure.query(async ({ ctx }) => {
    const getvideos = await ctx.db.query.videos.findMany({
      where: eq(videos.userId, ctx.user.id),
    });
    return getvideos;
  }),

  create: privateProcedure.mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id as string;
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) throw new Error('User not found');
    if (!user.currentConversationId)
      throw new Error('User has no conversation');

    const conversation = await ctx.db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, user?.currentConversationId),
        eq(conversations.userId, userId),
      ),
      with: {
        idea: true,
      },
    });

    if (!conversation) throw new Error('Conversation not found');
    if (!conversation.idea) throw new Error('Idea not found');

    const {
      ideaId,
      writerId,
      scriptId,
      voiceoverId,
      idea: { description },
    } = conversation;

    if (!ideaId || !writerId || !scriptId || !voiceoverId || !description) {
      throw new Error('Conversation is missing required data');
    }

    const id = v4();

    const videoResult = await ctx.db
      .insert(videos)
      .values({
        id,
        userId,
        ideaId,
        writerId,
        scriptId,
        voiceoverId,
        description,
      })
      .returning();

    return videoResult[0];
  }),

  update: privateProcedure
    .input(
      z.object({
        ...videoSchema.shape,
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const video = await ctx.db.query.videos.findFirst({
        where: and(eq(videos.id, input.id), eq(videos.userId, userId)),
      });

      if (!video) throw new Error('Video not found');

      const updatedVideo = await ctx.db
        .update(videos)
        .set({ voiceoverId: input.voiceoverId })
        .where(eq(videos.id, input.id))
        .returning();

      return updatedVideo[0];
    }),
});
