import 'server-only';

import { getMutableAIState, createStreamableUI } from 'ai/rsc';
import { LoadingSpinner } from '@/components/ui/spinner';
import { AiMessage } from '@/components/ui/ai-message';
import { runAsyncFnWithoutBlocking, sleep } from '@/lib/utils';
import { ContentCard } from '@/components/content-card';
import { generateScript } from '@/lib/ai/generateScript';
import { ScriptForm } from '@/components/script-form';
import { AI } from '../../../app/action';

export async function writeScript({
  title,
  description,
  style,
}: {
  title: string;
  description: string;
  style: string;
}) {
  'use server';

  const test = false;
  const modelScript = `In the STILLNESS of night, a dog approached a pond, its waters as SMOOTH as glass. There, in the depths, it saw the moon’s reflection and BARKED... The moon remained SILENT... unaffected. Each bark, a plea for the moon’s ATTENTION... yet the image merely quivered. FRUSTRATION mounted as the dog's efforts led only to ripples dancing across the water’s surface... The REAL moon, high above, watched in QUIET amusement, untouched by the chaos below... This tale echoes our OWN lives... often SHOUTING at reflections... frustrations at illusions of reality. Like the dog barking at the pond, we too CONFRONT images of our fears, desires, conflicts... Yet the ANSWER lies in seeking the TRUE nature of things... Look higher, beyond reflections, to understand life’s deep and MYSTICAL order... And now, if you like this content, follow for more!`;

  const aiState = getMutableAIState<typeof AI>();

  const writer = createStreamableUI(
    <AiMessage>
      <LoadingSpinner />
    </AiMessage>,
  );

  const systemMessage = createStreamableUI(null);

  runAsyncFnWithoutBlocking(async () => {
    let script = modelScript;
    if (!test) {
      script = await generateScript({
        title,
        description,
        style,
      });
    } else {
      await sleep(1000);
    }

    writer.done(<p>We done!</p>);

    systemMessage.done(
      <ContentCard
        className="max-w-128"
        title={title}
        description={<ScriptForm script={script} scriptId="1" />}
        hoverFx={false}
      />,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'system',
        content: `[Here's the script: ${script}]`,
      },
    ]);
  });

  return {
    writerUI: writer.value,
    newMessage: {
      id: Date.now(),
      display: systemMessage.value,
    },
  };
}
