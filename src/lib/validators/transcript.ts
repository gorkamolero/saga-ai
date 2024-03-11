import { z } from 'zod';

export const transcriptSchema = z.object({
  words: z.array(
    z.object({
      text: z.string(),
      start: z.number(),
      end: z.number(),
      index: z.number(),
    }),
  ),
});

export type TranscriptType = z.infer<typeof transcriptSchema>;
