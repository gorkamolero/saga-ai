import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import {
  conversations,
  ideas,
  scripts,
  users,
  videos,
} from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const videoSchema = createInsertSchema({
  ...videos,
  visualAssets: z.array(z.string()),
}).partial();
export type VideoType = z.infer<typeof videoSchema>;

export const videoRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const getvideos = await ctx.db.query.videos.findMany({
      where: eq(videos.userId, ctx.user.id),
    });
    return getvideos;
  }),

  get: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const getvideo = await ctx.db.query.videos.findFirst({
        where: eq(videos.id, input.id),
        with: {
          visualAssets: true,
        },
      });
      return getvideo;
    }),

  getFull: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const getvideo = await ctx.db.query.videos.findFirst({
        where: eq(videos.id, input.id),
        with: {
          visualAssets: true,
          voiceover: true,
          script: true,
        },
      });
      return {
        ...getvideo,
        script: getvideo?.script?.content || '',
      };
    }),

  create: privateProcedure
    .input(
      z.object({
        id: z.string(),
        data: videoSchema.partial().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) throw new Error('User not found');
      if (!user.currentConversationId)
        throw new Error('User has no conversation');

      const id = input?.id;

      const conversation = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, user?.currentConversationId),
      });

      if (!conversation) throw new Error('Conversation not found');
      if (!conversation.ideaId) throw new Error('Idea not found');

      const idea = await ctx.db.query.ideas.findFirst({
        where: eq(ideas.id, conversation?.ideaId),
      });

      const { ideaId, writerId, scriptId, voiceoverId } = conversation;

      if (!ideaId || !scriptId || !voiceoverId || !idea?.description) {
        throw new Error('Conversation is missing required data');
      }

      const voiceover = await ctx.db.query.voiceovers.findFirst({
        where: eq(videos.id, voiceoverId),
      });

      const duration = voiceover?.duration || 0;

      const otherData = input?.data || {};

      await ctx.db
        .insert(videos)
        .values({
          id,
          userId,
          ideaId,
          writerId,
          scriptId,
          voiceoverId,
          description: idea.description,
          duration: duration || 0,
          ...otherData,
        })
        .onConflictDoNothing()
        .returning();

      await ctx.db
        .update(conversations)
        .set({ videoId: id })
        .where(eq(conversations.id, user.currentConversationId));

      return {
        id,
      };
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
