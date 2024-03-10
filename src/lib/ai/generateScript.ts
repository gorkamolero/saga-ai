import { bravura } from '@/app/action';
import { scriptwriter } from '../prompts/scriptwriter';

export const generateScript = async ({
  title,
  description,
  style,
  cta = 'If you like this content, follow for more!',
}: {
  title: string;
  description: string;
  style: string;
  cta?: string;
}) => {
  const requestScriptMessage = `${description}. Style: ${style}. CTA: "If you like this content, follow for more!"`;
  try {
    const completion = await bravura.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: scriptwriter,
        } as const,
        {
          role: 'user',
          content: requestScriptMessage,
        } as const,
      ],
      model: 'anthropic/claude-3-opus',
    });

    let result = (completion.choices[0] as any)?.message.content;

    if (!result) return { error: 'No result' };

    return result;
  } catch (error: any) {
    console.error('ERROR ASKING GPT' + error.error.message);
  }
};
