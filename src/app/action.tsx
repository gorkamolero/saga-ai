import { OpenAI } from "openai";
import { createAI, getMutableAIState, render } from "ai/rsc";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// An example of a spinner component. You can also import your own components,
// or 3rd party component libraries.
function Spinner() {
  return <div>Loading...</div>;
}

// An example of a flight card component.
const IdeaCard = ({ description }: { description: string }) => {
  return (
    <Card>
      <CardHeader>Idea</CardHeader>
      <CardContent>{description}</CardContent>
    </Card>
  );
};

// An example of a function that fetches flight information from an external API.
async function getIdeas() {
  return [
    {
      id: "1",
      description: `Title: "Unveiling the Emerald Tablet"
    Description: "Explore the mystical Emerald Tablet, attributed to Hermes Trismegistus, and its cryptic phrases that have intrigued seekers for centuries."`,
    },
    {
      id: "2",
      description: `Title: "Hermes Trismegistus: The Thrice-Great Teacher"
    Description: "Learn about Hermes Trismegistus, revered as a teacher, philosopher, and guide, merging Atlantean and Egyptian knowledge."`,
    },
    {
      id: "3",
      description: `Title: "Atlantean Alchemy: The Quest for Transformation"
      Description: "Explore the Atlantean approach to alchemy, not just as physical transmutation but as a path to spiritual enlightenment."`,
    },
    // Add more ideas as needed
  ];
}

async function submitUserMessage(userInput: string) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();

  // Update the AI state with the new user message.
  aiState.update([
    ...aiState.get(),
    {
      role: "user",
      content: userInput,
    },
  ]);

  // The `render()` creates a generated, streamable UI.
  const ui = render({
    model: "gpt-4-0125-preview",
    provider: openai,
    messages: [
      {
        role: "system",
        content:
          "You are the user's writing assistant. If the user asks to give you yesterday's ideas, you just give them the ideas as if that was right now",
      },
      { role: "user", content: userInput },
    ],
    // `text` is called when an AI returns a text response (as opposed to a tool call).
    // Its content is streamed from the LLM, so this function will be called
    // multiple times with `content` being incremental.
    text: ({ content, done }) => {
      // When it's the final content, mark the state as done and ready for the client to access.
      if (done) {
        aiState.done([
          ...aiState.get(),
          {
            role: "assistant",
            content,
          },
        ]);
      }

      return <p>{content}</p>;
    },
    tools: {
      get_ideas: {
        description: "Get a list of ideas for the user",
        parameters: z
          .object({
            description: z.string().describe("the description of the idea"),
          })
          .required(),
        render: async function* () {
          // Show a spinner on the client while we wait for the response.
          yield <Spinner />;

          // Fetch the flight information from an external API.
          const ideas = await getIdeas();

          // Update the final AI state.
          aiState.done([
            ...aiState.get(),
            {
              role: "function",
              name: "get_ideas",
              // Content can be any string to provide context to the LLM in the rest of the conversation.
              content: JSON.stringify(ideas),
            },
          ]);

          // Return the flight card to the client.
          return (
            <div className="grid gap-4 ">
              {ideas.map((idea) => (
                <IdeaCard key={idea.id} description={idea.description} />
              ))}
            </div>
          );
        },
      },
    },
  });

  return {
    id: Date.now(),
    display: ui,
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
