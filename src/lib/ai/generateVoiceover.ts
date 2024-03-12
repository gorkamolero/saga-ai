import { openai } from '@/app/action';
import type { VOICEMODELS } from '../validators/voicemodel';

export async function generateVoiceover({
  script,
  voicemodel = 'onyx' as VOICEMODELS,
}: {
  script: string;
  voicemodel?: VOICEMODELS;
}) {
  try {
    const chunkSize = 4095;
    const scriptChunks = [];

    for (let i = 0; i < script.length; i += chunkSize) {
      scriptChunks.push(script.substring(i, i + chunkSize));
    }

    const buffers = await Promise.all(
      scriptChunks.map(async (chunk) => {
        const mp3Response = await openai.audio.speech.create({
          model: 'tts-1',
          voice: voicemodel,
          input: chunk,
        });
        const arrayBuffer = await mp3Response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }),
    );

    return Buffer.concat(buffers);
  } catch (error) {
    console.error('Error in text-to-speech conversion:', error);
    throw error;
  }
}

export default generateVoiceover;
