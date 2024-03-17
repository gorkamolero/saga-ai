import 'server-only';

import { OpenAI } from 'openai';
import { createAI, getMutableAIState, createStreamableUI } from 'ai/rsc';
import { z } from 'zod';
import { api } from '@/trpc/server';
import Bottleneck from 'bottleneck';
import logger from 'pino';
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
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Redirector } from '@/components/llm/redirector';
import { AiMarkdownMessage } from '@/components/ui/ai-markdown-message';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { HeaderSkeleton } from '@/components/ui/header-skeleton';
import { ContentCard } from '@/components/content-card';
import { ScriptForm } from '@/components/script-form';
import { VoiceModelSelector } from '@/components/llm/voicemodel-selector';
import { voicemodel } from '@/lib/validators';
import {
  aspectRatioByDuration,
  shortVideoDuration,
  videoSizeByDuration,
} from '@/lib/constants';

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
  conversationId: initialConversationId = v4(),
}: {
  message: string;
  conversationId?: string;
}) {
  'use server';

  let conversationId = initialConversationId;

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

If the user wants to write the script and you haven't been provided a style, you need to define a style for it yourself and propose it and ASK THE USER IF THAT'S OK. Ask them and when you're in agreement, call the "define_writer_style" function to allow them to save it.

The next step is to define a duration for the video. Sometimes the user will want a YouTube short and sometimes he won't care. This is very important to determine the format.

The next step is to write a script, with the following instructions: ${scriptwriter} and display it to them and ASK IF THEY LIKE IT. When the user likes it and you are done modifying it, call the "save_generated_script" function to allow the user to save it.

It can also happen that the user brings a script with them. In this case, go directly to the "save_user_script" function to save it.

The next step is to generate a voiceover. The user needs to choose a model for the voiceover so call the "choose_voiceover_model" function FIRST. Then when you know the model, you can go ahead and call the "generate_voiceover" function. You will receive a transcript and you have to look into it in the next step.

When the transcript is done, ask the user if they want to generate visual assets for the project. You need to define a style for the assets. Ask them, and when you're in agreement, call the "define_visual_style" function to allow them to save it If they want you to propose them, YOU ENTER INTO ARCHITECT MODE ${modernArchitect}

When you're done, call the "generate_assets" function to save for the user, with the exact timings you agreed upon for each visual asset.

After that, prompt the user to save their work as a channel for later use, and call the "save_as_channel" function to allow them to save it. Maybe they won't want to do this

When you're done, call the "generate_video" function to save the project and take the user to the editing interface.

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
        name: 'define_writer_style',
        description: 'Define the writing style of the script',
        parameters: z.object({
          verboseStyle: z
            .string()
            .describe('A verbose description of the style'),
        }),
      },
      {
        name: 'define_visual_style',
        description: 'Define the artistic style of the visual assets',
        parameters: z.object({
          style: z.string().describe('The style of the visual assets'),
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
        name: 'choose_voiceover_model',
        description: 'Choose the voiceover model for the voiceover',
        parameters: z.object({}),
      },
      {
        name: 'generate_voiceover',
        description: 'Generate a voiceover for the user',
        parameters: z.object({
          voicemodel: voicemodel.describe('The user chosen voiceover model'),
        }),
      },
      {
        name: 'generate_assets',
        description: 'Generate assets for the user',
        parameters: z.object({
          assets: z.array(
            z.object({
              description: z
                .string()
                .describe(
                  'The detailed description of the visual asset, in a very specific format to be fed as a prompt to an AI visual generation tool like DALL-E. No need to explain meaning here, straight up visual description.',
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
          duration: z.number().describe('The duration of the video in seconds'),
          style: z.string().describe('The chosen style for the visual assets'),
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
      {
        name: 'save_as_channel',
        description: 'Save a new channel for the user',
        parameters: z.object({
          name: z.string().describe('The name of the channel'),
          description: z.string().describe('The description of the channel'),
        }),
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
    logger().info('Fetching user content');
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
    logger().info('Saving idea');
    reply.update(
      <>
        <Redirector url={`/chats/${conversationId}`} />
        <AiMessage>
          <LoadingSpinner />
        </AiMessage>
      </>,
    );

    try {
      const conversation = await api.conversations.get.query({
        id: conversationId,
      });
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      if (conversation.ideaId) {
        conversationId = v4();
        await api.conversations.createAndSetInUser.mutate({
          id: conversationId,
        });
        reply.update(<Redirector url={`/chats/${conversationId}`} />);
      }
      await api.ideas.createIdea.mutate({
        id: conversationId,
        title,
        description,
      });
      await api.conversations.updateCurrent.mutate({
        ideaId: conversationId,
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

  completion.onFunctionCall('define_writer_style', async ({ verboseStyle }) => {
    const style = verboseStyle;
    logger().info('Defining writer style');
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
        name: 'define_writer_style',
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
      {
        role: 'user',
        content: 'Yes please, write the script',
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
    logger().info('Saving generated script');
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
    logger().info('Saving user script');
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

  completion.onFunctionCall('choose_voiceover_model', async () => {
    logger().info('Choosing voiceover model');
    aiState.done([
      ...aiState.get(),
      {
        role: 'system',
        content: `[The user's script is ready for voiceover generation. VoiceModel selector shown to the user]`,
      },
    ]);

    reply.done(
      <AiMessage>
        <div className="flex gap-2">
          <VoiceModelSelector scriptId={conversationId} />
        </div>
      </AiMessage>,
    );
  });

  completion.onFunctionCall('generate_voiceover', async ({ voicemodel }) => {
    logger().info('Generating voiceover');
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
        voicemodel: voicemodel ?? 'onyx',
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
        <div className="grid items-start gap-2">
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

  completion.onFunctionCall('define_visual_style', async ({ style }) => {
    logger().info('Defining visual style');
    const createArtist = await api.artists.create.mutate({
      id: conversationId,
      style,
    });

    if (!createArtist || !('id' in createArtist)) {
      reply.done(
        <AiMessage>
          <p>
            Sorry, I couldn't create a visual style style {style}. Would you
            like to try again?
          </p>
        </AiMessage>,
      );
      return;
    }

    await api.conversations.updateCurrent.mutate({
      artistId: createArtist.id,
    });

    const { id } = createArtist;

    const aiStateNow = aiState.get();
    const aiStateUpdate = [
      ...aiStateNow,
      {
        role: 'function',
        name: 'define_writer_style',
        content: `[UI to define the style "${style}" for the visual assets assets we will generate]`,
      },
      {
        role: 'system',
        content: `[The user has chosen the following style ${style} for the visual assets of the script]`,
      },
      {
        role: 'assistant',
        content: `Nice. We created an "artist" with the style "${style}". Would you like to continue?`,
      },
    ] as any;
    await api.conversations.updateAiState.mutate({
      id: conversationId,
      aiState: aiStateUpdate,
    });
    aiState.done(aiStateUpdate);
    await api.conversations.updateCurrent.mutate({
      artistId: id,
    });

    reply.done(
      <AiMessage>
        <p>{style}</p>
        <p>Great. Would you like to generate visual the assets now?</p>
      </AiMessage>,
    );
  });

  completion.onFunctionCall(
    'generate_assets',
    async ({ assets, duration, style }) => {
      logger().info('Generating assets');
      const limiter = new Bottleneck({
        maxConcurrent: 3,
        minTime: 333,
      });

      reply.update(
        <AiMessage>
          <div className="flex gap-2">
            <LoadingSpinner /> Generating visual assets
          </div>
        </AiMessage>,
      );

      await api.videos.create.mutate({
        id: conversationId,
        data: {
          type: duration > shortVideoDuration ? 'long' : 'short',
        },
      });

      const size = videoSizeByDuration(duration);

      const assetPromises = assets.map((asset) =>
        limiter.schedule(() =>
          api.assets.generateLight.mutate({
            description: asset.description,
            size,
            style,
            start: asset.start,
          }),
        ),
      );

      try {
        const assetResults = await Promise.all(assetPromises);
        const updatedAssets = assets.map((asset) => {
          const correspondingResult = assetResults.find(
            (result) => result.start === asset.start,
          );
          if (!correspondingResult) {
            return asset;
          }
          return {
            ...asset,
            url: correspondingResult.url,
          };
        });

        const uploadedAssets = await api.assets.saveMultiple.mutate({
          conversationId,
          assets: updatedAssets,
        });

        if (!uploadedAssets) {
          reply.done(
            <AiMessage>
              <p>
                Sorry, I couldn't generate the visual assets for you. Would you
                like me to try again?
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
            name: 'generate_assets',
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
            <div className="mb-8 flex w-screen flex-col gap-2 overflow-hidden px-8">
              <div className="md:auto-rows grid grid-cols-1 gap-2 md:grid-cols-3">
                {uploadedAssets.map((asset, i) => {
                  const url = asset.url!;
                  const id = asset.id;
                  const description = asset.description!;
                  return (
                    <ContentCard
                      key={i}
                      className="max-w-128 w-full"
                      description={asset.description}
                      hoverFx={false}
                      data-id={id}
                      xtra={
                        <div
                          style={{
                            aspectRatio: aspectRatioByDuration(duration),
                          }}
                        >
                          {url ? <img src={url} alt={description} /> : <div />}
                        </div>
                      }
                    />
                  );
                })}
              </div>
            </div>

            <AiMarkdownMessage>
              Your visual asset map have been saved. Would you like to generate
              the video?
            </AiMarkdownMessage>
          </>,
        );
      } catch (error) {
        reply.done(
          <AiMessage>
            <p>
              Sorry, I couldn't generate the visual assets for you. Would you
              like me to try again?
            </p>
          </AiMessage>,
        );
      }
    },
  );

  completion.onFunctionCall('generate_video', async () => {
    logger().info('Generating video');
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
    logger().info('Recalling project');
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

  completion.onFunctionCall(
    'save_as_channel',
    async ({ name, description }) => {
      logger().info('Saving as channel');
      const channel = await api.channels.create.mutate({
        conversationId,
        name,
        description,
      });

      if (!channel || !channel.id) {
        reply.done(
          <AiMessage>
            <p>
              Sorry, I couldn't save the channel with the name {name}. Would you
              like to try again?
            </p>
          </AiMessage>,
        );
        return;
      }

      await api.conversations.updateCurrent.mutate({
        channelId: channel.id,
      });

      const aiStateNow = aiState.get();
      const aiStateUpdate = [
        ...aiStateNow,
        {
          role: 'function',
          name: 'save_as_channel',
          content: `[Saved the channel with the name ${name}]`,
        },
        {
          role: 'assistant',
          content: `The channel has been saved successfully. You can view it now.`,
        },
      ] as any;

      await api.conversations.updateAiState.mutate({
        id: conversationId,
        aiState: aiStateUpdate,
      });
      aiState.done(aiStateUpdate);

      reply.done(
        <AiMessage>
          <p>The channel has been saved successfully. You can view it now.</p>
        </AiMessage>,
      );
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
  },
  // Each state can be any shape of object, but for chat applications
  // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
  initialUIState,
  initialAIState,
});
