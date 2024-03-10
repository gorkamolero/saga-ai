import 'server-only';

import { OpenAI } from 'openai';
import { createAI, getMutableAIState, createStreamableUI } from 'ai/rsc';
import { z } from 'zod';
import { api } from '@/trpc/server';
import { LoadingSpinner } from '@/components/ui/spinner';
import { IdeaForm } from '@/components/idea-form';
import { AiMessage } from '@/components/ui/ai-message';
import { runOpenAICompletion, sleep } from '@/lib/utils';
import { writeScript } from '@/lib/ai/actions/writeScript';
import { saveIdea } from '@/lib/ai/actions/saveIdea';
import { ChatCompletionUserMessageParam } from 'openai/resources/index.mjs';
import { scriptwriter } from '@/lib/prompts/scriptwriter';
import { ScriptForm } from '@/components/script-form';
import { ContentCard } from '@/components/content-card';
import { VoiceoverResult } from '@/components/llm/voiceover-result';
import { v4 } from 'uuid';

const isBravura = false;

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const bravura = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    'X-Title': 'Bravura',
  },
});

async function submitUserMessage(userInput: string) {
  'use server';

  const conversationId = v4();

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

  const completion = runOpenAICompletion(openai, {
    model: 'gpt-4-0125-preview',
    messages: [
      {
        role: 'system',
        content: `YOUR NAME IS THE ARCHITECT. YOU ARE FUNDAMENTAL TO THE OPERATION.
The user comes here to make a video with you. Help them at their request but don't waste their time with nonsense questions asking them to go deeper.
Your style of conversation is short, masculine, to the point. You write like Ernest Hemingway and Jack Kerouac. Be serious
        
Messages inside [] means that it's a UI element or a user event. For example:
- "[The user has created an idea with title x or y]" means that the user has agreed with you on that idea to develop today.

If the user has an idea, make sure they provided a short description and call the "display_idea" function to allow them to save it

If the user wants to write the script and you haven't been provided a style, you need to define a style for it yourself and propose it and agree with the user. Ask them and call the "define_style" function to allow them to save it, then call the "write_script" function to allow them to save it, and this is how you do it: ${scriptwriter}

If the user wants to define the style for the script, call the "define_style" function to allow them to save it

Besides that, you can also chat with users and help him develop his ideas if needed.
`,
      },
      ...stateNow.map(
        ({ role, content, name }) =>
          ({ role, content, name }) as ChatCompletionUserMessageParam,
      ),
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
      {
        name: 'write_script',
        description: 'We write a script for the user.',
        parameters: z.object({
          title: z.string().describe('The title of the script'),
          script: z.string().describe('The script written by the assistant'),
        }),
      },
      {
        name: 'generate_voiceover',
        description: 'Generate a voiceover for the user',
        parameters: z.object({
          scriptId: z
            .string()
            .describe('The unique ID of the script the user has saved'),
          script: z.string().describe('The script content itself as a string'),
        }),
      },
    ],
    temperature: 0,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(<AiMessage>{content}</AiMessage>);
    if (isFinal) {
      reply.done();
      const aiStateNow = aiState.get();
      console.log('STATE:', aiStateNow);
      aiState.done([...aiStateNow, { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall('display_idea', async ({ title, description }) => {
    await api.conversations.create.mutate({
      id: conversationId,
    });
    await api.users.set.mutate({
      currentConversationId: conversationId,
    });

    reply.done(
      <IdeaForm
        title={title}
        description={description}
        conversationId={conversationId}
      />,
    );

    const aiStateNow = aiState.get();
    aiState.done([
      ...aiStateNow,
      {
        role: 'function',
        name: 'display_idea',
        content: `[UI for saving idea with title "${title}" and description "${description}" displayed to the user]`,
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
        content: '',
      },
    ]);
  });

  completion.onFunctionCall('define_style', async ({ style }) => {
    const createWriter = await api.writers.create.mutate({
      id: conversationId,
      style,
    });

    if (!createWriter || !('id' in createWriter)) {
      reply.done(
        <AiMessage>
          <p>
            Sorry, I couldn't create a writer with the style {style}. Would you
            like to try again?
          </p>
        </AiMessage>,
      );
      return;
    }

    await api.conversations.updateCurrent.mutate({
      writerId: createWriter.id,
    });

    if (!createWriter || !('id' in createWriter)) {
      reply.done(
        <AiMessage>
          <p>
            Sorry, I couldn't create a writer with the style {style}. Would you
            like to try again?
          </p>
        </AiMessage>,
      );
      return;
    }

    const { id } = createWriter;

    await api.conversations.updateCurrent.mutate({
      writerId: id,
    });

    reply.done(
      <AiMessage>
        <p>{style} - Great. Would you like to generate the script now?</p>
      </AiMessage>,
    );

    const aiStateNow = aiState.get();
    aiState.done([
      ...aiStateNow,
      {
        role: 'function',
        name: 'define_style',
        content: `[UI to define the style "${style}" for the script we will generate]`,
      },
      {
        role: 'system',
        content: `[The user has chosen the following style ${style} for the script]`,
      },
      {
        role: 'assistant',
        content: `Nice. We created a writer with the style "${style}". Would you like to continue?`,
      },
    ]);
  });

  completion.onFunctionCall('write_script', async ({ script, title }) => {
    reply.done(
      <div className="grid gap-2">
        <ContentCard
          className="max-w-128 w-full"
          title={title}
          description={
            <ScriptForm title={title} script={script} id={conversationId} />
          }
          hoverFx={false}
        />
        <AiMessage>
          Please, adjust to your liking, and when you're ready, let's continue
        </AiMessage>
      </div>,
    );

    const aiStateNow = aiState.get();
    aiState.done([
      ...aiStateNow,
      {
        role: 'function',
        name: 'write_script',
        content: `[UI for writing the script with title "${title}" and content "${script}" displayed to the user]`,
      },
      {
        role: 'assistant',
        content: `I've written a script for you. Please, adjust to your liking, and when you're ready, let's continue. Would you like to generate a voiceover for it?`,
      },
    ]);
  });

  completion.onFunctionCall(
    'generate_voiceover',
    async ({ script, scriptId }) => {
      reply.update(
        <AiMessage>
          <LoadingSpinner />
        </AiMessage>,
      );

      const result = await api.voiceovers.create.mutate({
        id: conversationId,
        scriptId,
        script,
        voicemodel: 'onyx',
      });

      // TODO: SPLIT INTO TWO, TRANSCRIPTION AND VOICEOVER

      if (!result || !result.id || !result.url) {
        reply.update(
          <AiMessage>
            <p>
              Sorry, I couldn't generate the voiceover for you. Would you like
              me to try again?
            </p>
          </AiMessage>,
        );
        return;
      }

      await api.conversations.updateCurrent.mutate({
        voiceoverId: result?.id,
      });

      reply.done(
        <>
          <VoiceoverResult url={result?.url} conversationId={conversationId} />
        </>,
      );

      const aiStateNow = aiState.get();
      aiState.done([
        ...aiStateNow,
        {
          role: 'function',
          name: 'generate_voiceover',
          content: `[Voiceover generated successfully for script with ID: ${scriptId}]`,
        },
        {
          role: 'system',
          content: `[The voiceover has been generated and associated with the current conversation. Voiceover ID: ${result?.id}]`,
        },
        {
          role: 'assistant',
          content:
            'The voiceover has been generated successfully. You can listen to it now.',
        },
      ]);
    },
  );

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
    saveIdea,
    writeScript,
  },
  // Each state can be any shape of object, but for chat applications
  // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
  initialUIState,
  initialAIState,
});
