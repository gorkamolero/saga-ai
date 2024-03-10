import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { voiceovers } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { v4 } from 'uuid';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { generateVoiceover } from '@/lib/ai/generateVoiceover';
import generateTranscript from '@/lib/ai/generateTranscript';
import { remapTranscript } from '@/lib/utils';
import { VOICEMODELS } from '@/lib/validators/voicemodel';
import { Transcript } from 'assemblyai';

export const voiceoverRouter = createTRPCRouter({
  getVoiceovers: privateProcedure.query(async ({ ctx }) => {
    const getvoiceovers = await ctx.db.query.voiceovers.findMany({
      where: eq(voiceovers.userId, ctx.user.id),
    });
    return getvoiceovers;
  }),

  createVoiceover: privateProcedure
    .input(
      z.object({
        script: z.string(),
        scriptId: z.string(),
        voicemodel: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const voicemodel = input.voicemodel as VOICEMODELS;
      const id = v4();
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
        });

      if (voiceoverUploadResult.error) {
        throw voiceoverUploadResult.error;
      }

      const {
        data: { publicUrl: voiceoverUrl },
      } = supabase.storage.from('voiceovers').getPublicUrl(vurl);

      const fullTranscript = await generateTranscript({
        voiceoverUrl,
      });
      const transcript = remapTranscript(fullTranscript as Transcript);

      const voiceoverResult = await ctx.db
        .insert(voiceovers)
        .values({
          id,
          userId,
          scriptId: input.scriptId,
          url: voiceoverUrl,
          transcript,
          voicemodel,
        })
        .returning();

      return voiceoverResult[0];
    }),
});
