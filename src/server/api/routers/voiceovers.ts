import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { voiceovers } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { generateVoiceover } from '@/lib/ai/generateVoiceover';
import generateTranscript from '@/lib/ai/generateTranscript';
import { remapTranscript } from '@/lib/utils';
import { type VOICEMODELS } from '@/lib/validators/voicemodel';
import { createInsertSchema } from 'drizzle-zod';

export const voiceoverSchema = createInsertSchema(voiceovers).partial();
export type VoiceoverType = z.infer<typeof voiceoverSchema>;

export const voiceoverRouter = createTRPCRouter({
  getVoiceovers: privateProcedure.query(async ({ ctx }) => {
    const getvoiceovers = await ctx.db.query.voiceovers.findMany({
      where: eq(voiceovers.userId, ctx.user.id),
    });
    return getvoiceovers;
  }),

  get: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const getvoiceover = await ctx.db.query.voiceovers.findFirst({
        where: eq(voiceovers.id, input.id),
      });
      return getvoiceover;
    }),

  create: privateProcedure
    .input(
      z.object({
        script: z.string(),
        scriptId: z.string(),
        voicemodel: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const voicemodel = input.voicemodel as VOICEMODELS;
      if (!input.id) throw new Error('No id provided');
      const id = input.id;
      const voiceover = await generateVoiceover({
        script: input.script,
        voicemodel,
      });

      const supabase = createClient(cookies());

      const vurl = `${userId}/voiceover-${id}.mp3`;
      const voiceoverUploadResult = await supabase.storage
        .from('voiceovers')
        .upload(vurl, voiceover, {
          contentType: 'audio/mpeg',
          upsert: true,
          cacheControl: '3600',
        });

      if (voiceoverUploadResult.error) {
        throw voiceoverUploadResult.error;
      }

      const {
        data: { publicUrl: voiceoverUrl },
      } = supabase.storage.from('voiceovers').getPublicUrl(vurl);

      const voiceOverResult = await ctx.db
        .insert(voiceovers)
        .values({
          id,
          userId,
          scriptId: input.scriptId,
          url: voiceoverUrl,
          voicemodel,
        })
        .onConflictDoUpdate({
          target: voiceovers.id,
          set: {
            url: voiceoverUrl,
          },
        })
        .returning({
          id: voiceovers.id,
          url: voiceovers.url,
          duration: voiceovers.duration,
        });

      return voiceOverResult[0];
    }),

  transcribe: privateProcedure
    .input(
      z.object({
        id: z.string(),
        url: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = input.id;
      const url = input.url;

      const fullTranscript = (await generateTranscript({
        voiceoverUrl: url,
      }))!;
      const transcript = remapTranscript(fullTranscript);
      const duration = fullTranscript.audio_duration || 0;

      await ctx.db
        .update(voiceovers)
        .set({
          id,
          transcript,
          duration,
        })
        .where(eq(voiceovers.id, id));

      return transcript;
    }),
});
