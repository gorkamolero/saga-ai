import 'server-only';

import { OpenAI } from 'openai';
import { createAI, getMutableAIState, createStreamableUI } from 'ai/rsc';
import { z } from 'zod';
import { api } from '@/trpc/server';
import { LoadingSpinner } from '@/components/ui/spinner';
import { AiMessage } from '@/components/ui/ai-message';
import {
  cn,
  runAsyncFnWithoutBlocking,
  runOpenAICompletion,
} from '@/lib/utils';
import { saveIdea } from '@/lib/ai/actions/saveIdea';
import { type ChatCompletionUserMessageParam } from 'openai/resources/index.mjs';
import { scriptwriter } from '@/lib/prompts/scriptwriter';
import { VoiceoverResult } from '@/components/llm/voiceover-result';
import { v4 } from 'uuid';
import { modernArchitect } from '@/lib/prompts/modern-architect';
import { Card } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Redirector } from '@/components/llm/redirector';
import { AiMarkdownMessage } from '@/components/ui/ai-markdown-message';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { HeaderSkeleton } from '@/components/ui/header-skeleton';
import { ContentCard } from '@/components/content-card';
import { ScriptForm } from '@/components/script-form';

// const isBravura = false;

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

export const lemonfox = new OpenAI({
  apiKey: process.env.LEMONFOX_API_KEY,
  baseURL: 'https://api.lemonfox.io/v1',
});

async function submitUserMessage({
  message,
  conversationId = v4(),
}: {
  message: string;
  conversationId?: string;
}) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  const stateNow = aiState.get();
  aiState.update([
    ...stateNow,
    {
      role: 'user',
      content: message,
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
- "[The user has created an idea with title x or y]" means that the user and you have come up with an idea to develop.

If the user asks to see their content, ask what type of content (ideas / scripts / writers / videos / voiceovers) and call "fetch_user_content" to display the content to the user.
If the user wants to continue a conversation, that means to recall their project or idea or script, and you call "recall_project" to allow the user to recall their project and this will feed you the full project.

If the user has an idea, display it back to them with your own title and description and ASK IF IT'S OK, to modify or save it.

If you want to save an idea, call the "save_idea" function to allow the user to save it.

If the user wants to write the script and you haven't been provided a style, you need to define a style for it yourself and propose it and ASK THE USER IF THAT'S OK. Ask them and when you're in agreement, call the "define_style" function to allow them to save it.

The next step is to define a duration for the video. Sometimes the user will want a YouTube short and sometimes he won't care.

The next step is to write a script, with the following instructions: ${scriptwriter} and display it to them and ASK IF THEY LIKE IT. When the user likes it and you are done modifying it, call the "save_generated_script" function to allow the user to save it.

It can also happen that the user brings a script with them. In this case, go directly to the "save_user_script" function to save it.

The next step is to generate a voiceover. You can call the "generate_voiceover" function to allow this. You will receive a transcript and you have to look into it in the next step.

When the transcript is done, ask the user if they want to generate visual assets for the project. If they want you to propose them, YOU ENTER INTO ARCHITECT MODE ${modernArchitect}

When you're done, call the "save_assets" function to save for the user, with the exact timings you agreed upon for each visual asset.

Besides that, you can also chat with users and help him develop his ideas if needed.
`,
      },
      ...aiState
        .get()
        .map(
          ({ role, content, name }) =>
            ({ role, content, name }) as ChatCompletionUserMessageParam,
        ),
      { role: 'user', content: message },
    ],
    functions: [
      {
        name: 'fetch_user_content',
        description: 'Display content to the user',
        parameters: z.object({
          contentType: z
            .string()
            .describe(
              'The type of content to display. Could be ideas, scripts, writers, videos, voiceovers...',
            ),
        }),
      },
      {
        name: 'save_idea',
        description: 'Display the video idea back to the user',
        parameters: z.object({
          title: z.string().describe("A title for the user's idea"),
          description: z
            .string()
            .describe('A brief description of the video idea'),
        }),
      },
      {
        name: 'define_style',
        description: 'Define the writing style of the script',
        parameters: z.object({
          style: z.string().describe('The style of the script'),
        }),
      },
      {
        name: 'save_generated_script',
        description: 'Save the generated script for the user',
        parameters: z.object({
          script: z.string().describe('The script'),
        }),
      },
      {
        name: 'save_user_script',
        description: 'Save the user script',
        parameters: z.object({}),
      },
      {
        name: 'generate_voiceover',
        description: 'Generate a voiceover for the user',
        parameters: z.object({}),
      },
      {
        name: 'save_assets',
        description: 'Generate assets for the user',
        parameters: z.object({
          assets: z.array(
            z.object({
              description: z
                .string()
                .describe(
                  'The detailed description of the visual asset, in a very specific format to be fed as a prompt to an AI visual generation tool like DALL-E',
                ),
              start: z
                .number()
                .describe(
                  `The start time of the scene, corresponding to an exact word's start in the transcript`,
                ),
              end: z
                .number()
                .describe(
                  `The end time of the scene, corresponding to an exact word's end in the transcript`,
                ),
              startWordIndex: z
                .number()
                .describe(
                  'The corresponding word index in the transcript for the start time of the visual asset',
                ),
              endWordIndex: z
                .number()
                .describe(
                  'The corresponding word index in the transcript for the end time of the visual asset',
                ),
            }),
          ),
        }),
      },
      {
        name: 'generate_video',
        description:
          'Save the project and take the user to the editing interface',
        parameters: z.object({}),
      },
      {
        name: 'recall_project',
        description: 'Recall the project for the user',
        parameters: z.object({}),
      },
    ],
    temperature: 0,
  });

  completion.onTextContent(async (content: string, isFinal: boolean) => {
    reply.update(<AiMarkdownMessage>{content}</AiMarkdownMessage>);
    if (isFinal) {
      reply.done();
      const aiStateNow = aiState.get();
      aiState.done([...aiStateNow, { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall('fetch_user_content', async ({ contentType }) => {
    reply.update(
      <AiMessage>
        <LoadingSpinner />
      </AiMessage>,
    );

    type ItemType = {
      title: string;
      description: string;
      id: string;
    };

    let items = [] as ItemType[];
    let cardsize = 'small';

    if (contentType === 'ideas') {
      const ideas = await api.ideas.getAll.query();
      if (ideas) {
        items = ideas.map((idea) => ({
          title: idea.title ?? '',
          description: idea.description ?? '',
          id: idea.id,
        }));
      }
    }

    if (contentType === 'scripts') {
      const scripts = await api.scripts.getAll.query();
      if (scripts) {
        items = scripts.map((script) => ({
          title: script.idea.title ?? '',
          description: script.content ?? '',
          id: script.id ?? '',
        }));
        cardsize = 'large';
      }
    }

    if (contentType === 'writers') {
      const writers = await api.writers.getAll.query();
      if (writers) {
        items = writers.map((writer) => ({
          title: writer.style ?? '',
          description: '',
          id: writer.id,
        }));
      }
    }

    reply.done(
      <div className="mb-8 flex w-screen flex-col gap-2 overflow-hidden px-8">
        <div className="relative flex h-auto w-full flex-col  overflow-hidden ">
          <BentoGrid
            horizontal
            className={cn(cardsize === 'large' && 'grid-rows-3 gap-12')}
          >
            {items.map((item, i) => (
              <>
                <label key={i} className="flex-shrink-0 cursor-pointer">
                  <input
                    type="radio"
                    name="content"
                    value={item.id}
                    className="sr-only"
                  />
                  <BentoGridItem
                    key={i}
                    title={item.title}
                    description={item.description}
                    header={<HeaderSkeleton />}
                    horizontal
                    className={cn(
                      i === 3 || i === 6 ? 'md:row-span-2' : '',
                      cardsize === 'large' && 'w-[32rem]',
                    )}
                  />
                </label>
              </>
            ))}
          </BentoGrid>
        </div>
      </div>,
    );

    const aiStateNow = aiState.get();
    const aiStateUpdate = [
      ...aiStateNow,
      {
        role: 'function',
        name: 'fetch_user_content',
        content: `[Displayed ${contentType} to the user]`,
      },
      {
        role: 'assistant',
        content: `Here are some ${contentType} I found. Would you like to continue?`,
      },
    ] as any;
    await api.conversations.updateAiState.mutate({
      id: conversationId,
      aiState: aiStateUpdate,
    });
  });

  completion.onFunctionCall('save_idea', async ({ title, description }) => {
    reply.update(
      <AiMessage>
        <LoadingSpinner />
      </AiMessage>,
    );

    try {
      await api.ideas.createIdea.mutate({
        id: conversationId,
        title,
        description,
      });

      const aiStateNow = aiState.get();
      const aiStateUpdate = [
        ...aiStateNow,
        {
          role: 'function',
          name: 'save_idea',
          content: `[UI to save the idea with title "${title}" and description "${description}" displayed to the user]`,
        },
        {
          role: 'assistant',
          content: `Good. We've saved "${title}" - "${description}". Would you like to go on and write the script?`,
        },
      ] as any;

      await api.conversations.updateAiState.mutate({
        id: conversationId,
        aiState: aiStateUpdate,
      });

      aiState.done([...aiStateUpdate]);

      reply.done(
        <AiMessage>
          <p>
            Great. We've saved "{title}" - "{description}"
          </p>
          <p>Would you like to go on and write the script?</p>
        </AiMessage>,
      );
      await api.conversations.updateCurrent.mutate({
        ideaId: conversationId,
      });
    } catch (error) {
      reply.done(
        <AiMessage>
          <p>
            Sorry, I couldn't save the idea "{title}" - "{description}". Would
            you like to try again?
          </p>
        </AiMessage>,
      );
    }
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

    const aiStateNow = aiState.get();
    const aiStateUpdate = [
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
    ] as any;
    await api.conversations.updateAiState.mutate({
      id: conversationId,
      aiState: aiStateUpdate,
    });
    aiState.done(aiStateUpdate);
    await api.conversations.updateCurrent.mutate({
      writerId: id,
    });

    reply.done(
      <AiMessage>
        <p>{style}</p>
        <p>Great. Would you like to generate the script now?</p>
      </AiMessage>,
    );
  });

  completion.onFunctionCall('save_generated_script', async ({ script }) => {
    await api.scripts.createOrUpdate.mutate({
      id: conversationId,
      script,
    });

    const aiStateNow = aiState.get();
    const aiStateUpdate = [
      ...aiStateNow,
      {
        role: 'function',
        name: 'save_generated_script',
        content: `[The user has saved the script with the following content: "${script}"]`,
      },
      {
        role: 'assistant',
        content: `Great. We've saved the script. Would you like to generate a voiceover?`,
      },
    ] as any;
    await api.conversations.updateAiState.mutate({
      id: conversationId,
      aiState: aiStateUpdate,
    });
    aiState.done(aiStateUpdate);

    reply.done(
      <AiMessage>
        <p>
          Great. We've saved the script. Would you like to generate a voiceover?
        </p>
      </AiMessage>,
    );
  });

  completion.onFunctionCall('save_user_script', async () => {
    reply.done(
      <div className="grid gap-2">
        <ContentCard
          className="max-w-128 w-full"
          description={<ScriptForm id={conversationId} />}
          hoverFx={false}
        />
      </div>,
    );

    const aiStateNow = aiState.get();
    aiState.done([
      ...aiStateNow,
      {
        role: 'function',
        name: 'write_script',
        content: `[UI for writing the script with displayed to the user]`,
      },
    ]);
  });

  completion.onFunctionCall('generate_voiceover', async () => {
    const script = await api.scripts.get.query({
      id: conversationId,
    });

    reply.update(
      <AiMessage>
        <div className="flex gap-2">
          <LoadingSpinner /> Generating voiceover
        </div>
      </AiMessage>,
    );

    if (!script || !script.content) {
      reply.done(
        <AiMessage>
          <p>
            Sorry, I couldn't generate the voiceover for you. Would you like me
            to try again?
          </p>
        </AiMessage>,
      );
      return;
    }

    await runAsyncFnWithoutBlocking(async () => {
      const voiceover = await api.voiceovers.create.mutate({
        id: conversationId,
        scriptId: conversationId,
        script: script?.content,
        voicemodel: 'onyx',
      });

      if (!voiceover?.id || !voiceover.url) {
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

      reply.update(
        <div className="grid gap-2">
          <AiMessage>Here's your voiceover</AiMessage>
          <VoiceoverResult url={voiceover?.url} />
          <AiMessage>
            <div className="flex gap-2">
              <LoadingSpinner /> Transcribing your voiceover...
            </div>
          </AiMessage>
        </div>,
      );

      let aiStateUpdate = [
        ...aiState.get(),
        {
          role: 'system',
          name: 'generate_voiceover',
          content: `[Generated voiceover with url ${voiceover?.url} for the user's script and displayed UI]`,
        },
      ] as any;

      aiState.update(aiStateUpdate);

      const transcript = await api.voiceovers.transcribe.mutate({
        id: voiceover?.id,
        url: voiceover.url,
      });

      const stringifiedTranscript = JSON.stringify(transcript);

      console.log('transcript', stringifiedTranscript);

      await api.conversations.updateCurrent.mutate({
        voiceoverId: voiceover?.id,
      });

      const aiStateNow = aiState.get();
      aiStateUpdate = [
        ...aiStateNow,
        {
          role: 'function',
          name: 'generate_voiceover',
          content: `[Voiceover and transcript fully generated successfully for script with ID: ${conversationId}]. The script duration is ${voiceover.duration}`,
        },
        {
          role: 'system',
          content: `[The transcript generated, with every words start and end times in milliseconds. You will use these to generating visual assets: ${JSON.stringify(transcript)}]`,
        },
        {
          role: 'assistant',
          content:
            'The voiceover has been generated successfully. You can listen to it now. Would you like to generate visual assets for the project?',
        },
      ] as any;
      await api.conversations.updateAiState.mutate({
        id: conversationId,
        aiState: aiStateUpdate,
      });
      aiState.done(aiStateUpdate);

      reply.done(
        <div className="grid gap-2">
          <AiMessage>Here's your voiceover</AiMessage>
          <VoiceoverResult url={voiceover?.url} />
          <AiMessage>
            <p>The voiceover has been generated and transcribed.</p>
            <br />
            <p>
              We are almost at the last step. Would you like to generate visual
              assets for the project or simply go to the editing interface?
            </p>
          </AiMessage>
        </div>,
      );
    });
  });

  completion.onFunctionCall('save_assets', async ({ assets }) => {
    reply.update(
      <AiMessage>
        <LoadingSpinner /> Generating visual assets
      </AiMessage>,
    );

    await api.videos.create.mutate({
      id: conversationId,
    });

    const mappedAssets = await api.assets.saveMultiple.mutate({
      conversationId,
      assets,
    });

    if (!mappedAssets) {
      reply.done(
        <AiMessage>
          <p>
            Sorry, I couldn't generate the visual assets for you. Would you like
            me to try again?
          </p>
        </AiMessage>,
      );
      return;
    }

    const aiStateNow = aiState.get();
    const aiStateUpdate = [
      ...aiStateNow,
      {
        role: 'function',
        name: 'save_assets',
        content: `[Saved visual assets for user's video and displayed UI]`,
      },
      {
        role: 'assistant',
        content: `Your visual asset map have been saved. Would you like to generate the video?`,
      },
    ] as any;
    await api.conversations.updateAiState.mutate({
      id: conversationId,
      aiState: aiStateUpdate,
    });
    aiState.done(aiStateUpdate);

    reply.done(
      <>
        <AiMessage>
          <p>
            The visual assets have been generated successfully. You can view
            them now. Would you like to generate the video?
          </p>
        </AiMessage>
      </>,
    );
  });

  completion.onFunctionCall('generate_video', async () => {
    const script = await api.scripts.get.query({
      id: conversationId,
    });
    const type = (script?.wordCount || 0) > 180 ? 'long' : 'short';

    const { id } = await api.videos.create.mutate({
      id: conversationId,
      data: { type },
    });

    reply.done(<Redirector url={`/videos/${id}`} />);

    const aiStateNow = aiState.get();
    const aiStateUpdate = [
      ...aiStateNow,
      {
        role: 'function',
        name: 'generate_video',
        content: `[Generated video with ID: ${id}]`,
      },
      {
        role: 'assistant',
        content: `The video has been generated successfully. You can view it now.`,
      },
    ] as any;

    await api.conversations.updateAiState.mutate({
      id: conversationId,
      aiState: aiStateUpdate,
    });
    aiState.done(aiStateUpdate);
  });

  completion.onFunctionCall('recall_project', async () => {
    const convo = await api.conversations.get.query({
      id: conversationId,
    });

    if (!convo) {
      reply.done(
        <AiMessage>
          <p>
            Sorry, I couldn't recall the conversation. Would you like me to try
            again?
          </p>
        </AiMessage>,
      );
      return;
    }

    const aiStateURL = `${convo.userId}/${conversationId}.json`;

    const client = createClient(cookies());
    const { data: aiStateJSON, error } = await client.storage
      .from('aiState')
      .download(aiStateURL);

    if (error) {
      reply.done(
        <AiMessage>
          <p>
            Sorry, I couldn't recall the conversation. Would you like me to try
            again?
          </p>
        </AiMessage>,
      );
      return;
    }

    const aiStateJSONString = await aiStateJSON.text();

    const convoState = JSON.parse(aiStateJSONString);

    const aiStateNow = aiState.get();

    const fullAiState = new Set([...aiStateNow, ...convoState]);

    const aiStateUpdate = [
      ...fullAiState,
      {
        role: 'function',
        name: 'recall_project',
        content: `[Recalled the project with ID: ${conversationId}]`,
      },
      {
        role: 'assistant',
        content: `The project has been recalled successfully. You can view it now. Would you like me to summarize it?`,
      },
    ] as any;

    await api.conversations.updateAiState.mutate({
      id: conversationId,
      aiState: aiStateUpdate,
    });
    aiState.done(aiStateUpdate);

    reply.done(
      <AiMessage>
        <p>I remember now. Would you like me to summarize it for you?</p>
      </AiMessage>,
    );
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
    saveIdea,
  },
  // Each state can be any shape of object, but for chat applications
  // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
  initialUIState,
  initialAIState,
});
