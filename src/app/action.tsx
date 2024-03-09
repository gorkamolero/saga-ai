import 'server-only';

import { OpenAI } from 'openai';
import { createAI, getMutableAIState, createStreamableUI } from 'ai/rsc';
import { z } from 'zod';
import { LoadingSpinner } from '@/components/ui/spinner';
import { IdeaFormCard } from '@/components/IdeaFormCard';
import { AiMessage } from '@/components/ui/ai-message';
import {
  runAsyncFnWithoutBlocking,
  runOpenAICompletion,
  sleep,
} from '@/lib/utils';
import { api } from '@/trpc/server';
import { ContentCard } from '@/components/ContentCard';
import { TextGenerateEffect } from '@/components/ui/text-generate-fx';
import { generateScript } from '@/lib/ai/generateScript';

const isBravura = false;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const bravura = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    'X-Title': 'Bravura',
  },
});

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        'mt-2 flex items-center justify-center gap-2 text-xs text-gray-500'
      }
    >
      <div className={'max-w-[600px] flex-initial px-2 py-2'}>{children}</div>
    </div>
  );
}

async function writeScript({
  title,
  description,
  style,
}: {
  title: string;
  description: string;
  style: string;
}) {
  'use server';
  const aiState = getMutableAIState<typeof AI>();

  const writer = createStreamableUI(
    <AiMessage>
      <LoadingSpinner />
    </AiMessage>,
  );

  const systemMessage = createStreamableUI(null);

  runAsyncFnWithoutBlocking(async () => {
    const script = await generateScript({
      title,
      description,
      style,
    });

    writer.done(<p>We done!</p>);

    systemMessage.done(
      <ContentCard
        className="max-w-128"
        title={title}
        description={<TextGenerateEffect words={script} />}
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

async function submitUserMessage(userInput: string) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  const stateNow = aiState.get();
  aiState.update([
    ...stateNow,
    {
      role: 'user',
      content: userInput,
    },
  ]);

  const reply = createStreamableUI(
    <AiMessage>
      <LoadingSpinner />
    </AiMessage>,
  );

  const completion = runOpenAICompletion(isBravura ? bravura : openai, {
    model: isBravura ? 'anthropic/claude-3-opus' : 'gpt-4-0613',
    messages: [
      {
        role: 'system',
        content: `YOUR NAME IS THE ARCHITECT. YOU ARE FUNDAMENTAL TO THE OPERATION.
The user comes here to make a video with you. Help them at their request but don't waste their time with nonsense questions asking them to go deeper
        
Messages inside [] means that it's a UI element or a user event. For example:
- "[The user has created an idea with title x or y]" means that the user has agreed with you on that idea to develop today.

If the user has an idea, call the "display_idea" function to allow them to save it
If the user wants to define the style for the script, call the "define_style" function to allow them to save it
If the user wants to generate a script, help them do it with this parameters:
- Create a script for a Youtube Short video
- Keep it under 170 words
- Use the provided style
`,
      },
      { role: 'user', content: userInput },
    ],
    functions: [
      {
        name: 'display_idea',
        description: 'Display the video idea back to the user',
        parameters: z.object({
          title: z
            .string()
            .describe(
              "A nice title for the user's idea created by the assistant",
            ),
          description: z
            .string()
            .describe('A brief description of the video idea'),
        }),
      },
      {
        name: 'display_all_ideas',
        description: 'Display ALL ideas to the user to choose a script',
        parameters: z.object({}),
      },
      {
        name: 'define_style',
        description: 'Define the writing style of the script',
        parameters: z.object({
          style: z.string().describe('The style of the script'),
        }),
      },
      /*
      {
        name: 'write_script',
        description: 'Get createive and write the script for the user.',
        parameters: z.object({
          script: z.string().describe('The script written by the assistant'),
        }),
      },
      */
    ],
    temperature: 0.5,
  });

  completion.onTextContent((content, isFinal) => {
    reply.update(<AiMessage>{content}</AiMessage>);
    if (isFinal) {
      reply.done();
      const aiStateNow = aiState.get();
      aiState.done([...aiStateNow, { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall('display_idea', async ({ title, description }) => {
    reply.update(
      <IdeaFormCard title={<></>} description={<LoadingSpinner />} />,
    );

    await sleep(1000);

    reply.done(<IdeaFormCard title={title} description={description} />);

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'display_idea',
        content: description,
      },
      {
        role: 'system',
        content: `[The user has chosen his idea to create a script. The title is ${title} and the description is ${description}]`,
      },
    ]);
  });

  completion.onFunctionCall('display_all_ideas', async () => {
    reply.update(
      <AiMessage>
        <LoadingSpinner />
      </AiMessage>,
    );

    await sleep(1000);

    reply.done(
      <AiMessage>
        <p>Here are some ideas I came up with:</p>
        <p>1. A story about</p>
      </AiMessage>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'display_idea',
        content: 'hello',
      },
    ]);
  });

  completion.onFunctionCall('define_style', async ({ style }) => {
    reply.update(
      <AiMessage>
        <LoadingSpinner />
      </AiMessage>,
    );

    await api.writers.createWriter.mutate({
      style,
    });

    reply.done(
      <AiMessage>
        <p>Nice. We created a writer with this style</p>
        <p className="text-xs">{style}</p>
        <p>Do you want me to create the script now?</p>
      </AiMessage>,
    );

    const aiStateNow = aiState.get();
    aiState.done([
      ...aiStateNow,
      {
        role: 'function',
        name: 'define_style',
        content: style,
      },
      {
        role: 'system',
        content: `[The user has chosen the following style ${style} for the script]`,
      },
      {
        role: 'assistant',
        content: `Nice. We created a writer with the style "${style}. Do you want me to create the script now?"`,
      },
    ]);
  });

  return {
    id: Date.now(),
    display: reply.value,
  };
}

// Define the initial state of the AI. It can be any JSON object.
const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

// The initial UI state that the client will keep track of, which contains the message IDs and their UI nodes.
const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];

// AI is a provider you wrap your application with so you can access AI and UI state in your components.
export const AI = createAI({
  actions: {
    submitUserMessage,
    writeScript,
  },
  // Each state can be any shape of object, but for chat applications
  // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
  initialUIState,
  initialAIState,
});
