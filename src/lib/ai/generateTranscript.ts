import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY!,
});

export { client };

export async function generateTranscript({
  voiceoverUrl,
}: {
  voiceoverUrl: string;
}) {
  const config = {
    audio: voiceoverUrl,
  };

  try {
    const captions = await client.transcripts.transcribe(config);
    return captions;
  } catch (error) {
    console.error('Error in audio caption:', error);
  }
}

export default generateTranscript;
