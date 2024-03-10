import { v4 } from 'uuid';
import parseJson from 'parse-json';
import { TranscriptType } from '../validators/transcript';
import { visualAssetSchema } from '@/server/api/routers/assets';
import { architect } from '../prompts/architect';
import { bravura, openai } from '@/app/action';

const instructions =
  'Please read this full script, propose beautiful imagery and map images to the timings provided.';

const prompt = ({
  script,
  transcript,
}: {
  script: string;
  transcript: TranscriptType;
}) => `${instructions}:
Script : ${script}

---

Script divided in words and timing: ${transcript}

---

REMEMBER: OUTPUT EXCLUSIVELY JSON ARRAY WITH [{
	"description": "...",
	"start": ...,
	"end": ...,
}]`;

export const generateAssets = async ({
  script,
  transcript,
  userId,
  videoId,
}: {
  script: string;
  transcript: TranscriptType;
  userId: string;
  videoId: string;
}) => {
  try {
    const isBravura = false;
    const model = isBravura ? 'anthropic/claude-3-opus' : 'gpt-4-0125-preview';

    console.log('Generating assets with model:', model);
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: architect,
        },
        {
          role: 'user',
          content: prompt({ script, transcript }),
        },
      ],
    });

    let result = (completion.choices[0] as any).message.content;

    result = result.includes('```json')
      ? result.replace('```json\n', '').replace('```', '')
      : result;

    const assetMap = parseJson(result) as unknown as any[];

    const assets = assetMap.map(
      ({
        description,
        start,
        end,
      }: {
        description: string;
        start: number;
        end: number;
      }) =>
        visualAssetSchema.parse({
          description,
          userId,
          videoId,
          fx: 'perspective',
          transition: 'fade',
          start,
          end,
        }),
    );

    return assets;
  } catch (error) {
    console.error(error);
    throw new Error('Error generating assets');
  }
};
