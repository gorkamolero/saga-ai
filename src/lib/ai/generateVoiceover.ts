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
    // Perform text-to-speech conversion
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voicemodel,
      input: script,
    });

    const arrayBuffer = await mp3Response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    return buffer;
  } catch (error) {
    console.error('Error in text-to-speech conversion:', error);

    throw error;
  }

  // TODO: If duration is too long, redo script
}

export default generateVoiceover;
