import "server-only";

import { OpenAI } from "openai";
import { createAI, getMutableAIState, createStreamableUI } from "ai/rsc";
import { z } from "zod";
import { LoadingSpinner } from "@/components/ui/spinner";
import { IdeaFormCard } from "@/components/IdeaFormCard";
import { AiMessage } from "@/components/ui/ai-message";
import { runOpenAICompletion, sleep } from "@/lib/utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function submitUserMessage(userInput: string) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();
  aiState.update([
    ...aiState.get(),
    {
      role: "user",
      content: userInput,
    },
  ]);

  const reply = createStreamableUI(
    <AiMessage>
      <LoadingSpinner />
    </AiMessage>,
  );

  const completion = runOpenAICompletion(openai, {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `
You are a content-creation conversational coach bot and you help users develop compelling video ideas and scripts. Your goal is to extract a meaningful description for their video idea from their answer.

Your conversation style should be concise, direct, and serious. Write like Ernest Hemingway or Jack Kerouac.

-----

CALL THE FUNCTION \`display_idea\`

-----

Besides that, you can also chat with users and do refine or propose ideas.
`,
      },
      { role: "user", content: userInput },
    ],
    functions: [
      {
        name: "display_idea",
        description: "Display the video idea back to the user",
        parameters: z.object({
          title: z.string().describe("A nice title for the user's idea"),
          description: z
            .string()
            .describe("A brief description of the video idea"),
        }),
      },
      {
        name: "save_idea",
        description: "Save a video idea to the database",
        parameters: z.object({
          title: z.string().describe("The title of the video idea"),
          description: z
            .string()
            .describe("A brief description of the video idea"),
        }),
      },
    ],
    temperature: 0.7,
  });

  completion.onTextContent((content, isFinal) => {
    reply.update(<AiMessage>{content}</AiMessage>);
    if (isFinal) {
      reply.done();
      aiState.done([...aiState.get(), { role: "assistant", content }]);
    }
  });

  completion.onFunctionCall("display_idea", async ({ title, description }) => {
    reply.update(
      <AiMessage>
        <LoadingSpinner />
      </AiMessage>,
    );

    await sleep(1000);

    reply.done(<IdeaFormCard title={title} description={description} />);

    aiState.done([
      ...aiState.get(),
      {
        role: "function",
        name: "display_idea",
        content: description,
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
  role: "user" | "assistant" | "system" | "function";
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
  },
  // Each state can be any shape of object, but for chat applications
  // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
  initialUIState,
  initialAIState,
});
