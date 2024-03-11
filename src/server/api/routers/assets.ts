import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { conversations, videos, visualAssets } from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { v4 } from 'uuid';
import { createInsertSchema } from 'drizzle-zod';
import { TranscriptType } from '@/lib/validators/transcript';
import { generateAssets, mapNewAssets } from '@/lib/ai/generateAssets';
import { searchUnsplashPhotos } from '../utils/unsplash';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { generateImageWithLemonfox } from '@/lib/ai/genLemonFox';
import { animateImage } from '@/lib/ai/animateImage';

export const visualAssetSchema = createInsertSchema(visualAssets).partial();
export type VisualAssetType = z.infer<typeof visualAssetSchema>;

export const visualAssetRouter = createTRPCRouter({
  getAll: privateProcedure
    .input(
      z.object({
        videoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const getAssets = await ctx.db.query.visualAssets.findMany({
        where: and(
          eq(visualAssets.userId, ctx.user.id),
          eq(visualAssets.videoId, input.videoId),
        ),
      });
      return getAssets;
    }),

  get: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input || !input?.id) throw new Error('No id provided');
      const visualAsset = await ctx.db.query.visualAssets.findFirst({
        where: eq(visualAssets.id, input.id),
      });
      return visualAsset;
    }),

  update: privateProcedure
    .input(
      z.object({
        ...visualAssetSchema.shape,
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input || !input?.id) throw new Error('No id provided');
      await ctx.db
        .update(visualAssets)
        .set({
          ...input,
        })
        .where(eq(visualAssets.id, input.id));
      return true;
    }),
  saveMultiple: privateProcedure
    .input(
      z.object({
        conversationId: z.string(),
        assets: z.array(visualAssetSchema.partial()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input || !input?.assets || input.assets.length === 0)
        throw new Error('No assets provided');

      if (!input?.conversationId) throw new Error('No conversationId provided');

      const conversation = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, input.conversationId),
      });

      const userId = ctx.user.id as string;
      const videoId = conversation?.videoId as string;

      await ctx.db
        .delete(visualAssets)
        .where(eq(visualAssets.videoId, videoId));

      const assetsWithIdAndIndex = input.assets
        .map((asset, index) =>
          mapNewAssets({
            ...asset,
            description: asset.description as string,
            start: asset.start as number,
            end: asset.end as number,
            wordIndex: asset.wordIndex as number,
            index,
            userId: userId,
            videoId: videoId,
          }),
        )
        .map((asset) => ({
          ...asset,
          id: v4(),
        }));

      const assets = await ctx.db
        .insert(visualAssets)
        .values(assetsWithIdAndIndex)
        .returning();

      return assets;
    }),

  generateAssets: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id as string;
      const video = await ctx.db.query.videos.findFirst({
        where: eq(videos.id, input.id),
        with: {
          voiceover: true,
          script: true,
        },
      });

      if (!video || !video.voiceover || !video.script) {
        throw new Error('Video not found');
      }

      const transcript = video?.voiceover?.transcript as TranscriptType;
      const script = video?.script?.content as string;

      const areThereAssets = await ctx.db.query.visualAssets.findMany({
        where: and(eq(visualAssets.videoId, input.id)),
      });

      // delete them all
      if (areThereAssets.length > 0) {
        await ctx.db
          .delete(visualAssets)
          .where(eq(visualAssets.videoId, input.id));
      }

      const assets = (await generateAssets({
        script,
        transcript,
        userId,
        videoId: input.id,
      })) as VisualAssetType[];

      const assetsWithIdAndIndex = assets.map((asset, index) => ({
        ...asset,
        index: index + 1,
        id: v4(),
      }));

      const dbAssets = await ctx.db
        .insert(visualAssets)
        .values(assetsWithIdAndIndex)
        .returning();

      return dbAssets;
    }),

  callUnsplash: privateProcedure
    .input(
      z.object({
        query: z.string(),
        page: z.number().optional(),
        perPage: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const images = await searchUnsplashPhotos({
        query: input.query,
        page: input.page,
        perPage: input.perPage,
      });

      return images;
    }),

  generateImage: privateProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id as string;
      const id = input.id;
      const description = input.description;

      if (!id || !description) {
        throw new Error('No image found or no description');
      }

      const remoteUrl = await generateImageWithLemonfox({
        description,
      });

      const imageLocalRequest = await fetch(remoteUrl);
      const imageLocal = await imageLocalRequest.blob();

      const iurl = `${userId}/image-${id}.png`;

      const client = createClient(cookies());

      const imageUploadResult = await client.storage
        .from(`images`)
        .upload(iurl, imageLocal, {
          cacheControl: '3600',
          upsert: true,
        });

      if (imageUploadResult.error) {
        throw imageUploadResult.error;
      }

      const {
        data: { publicUrl: url },
      } = client.storage.from('images').getPublicUrl(iurl);

      await ctx.db
        .update(visualAssets)
        .set({
          url,
          generated: true,
          generatedAt: new Date(),
        })
        .where(eq(visualAssets.id, id));
    }),

  animate: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id as string;
      const id = input.id;

      if (!id) {
        throw new Error('No image found or no animation');
      }

      await animateImage({
        id,
        userId,
      });
    }),
});
