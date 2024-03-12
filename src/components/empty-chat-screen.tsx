import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
// import { ExternalLink } from "@/components/external-link";
import { ArrowRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { v4 } from 'uuid';

const exampleMessages = [
  {
    heading: 'I have an idea',
    message: 'I have an idea',
  },
  /*
  {
    heading: "What's the stock price of AAPL?",
    message: "What's the stock price of AAPL?",
  },
  {
    heading: "I'd like to buy 10 shares of MSFT",
    message: "I'd like to buy 10 shares of MSFT",
  },
  */
];

export function EmptyScreen({
  submitMessage,
}: {
  submitMessage: (message: string) => void;
}) {
  const router = useRouter();

  const { conversationId } = useParams();
  const { data: user, isLoading } = api.users.get.useQuery();
  const { mutate: createConversation } =
    api.conversations.createAndSetInUser.useMutation();

  const handleContinueConversation = (e: React.MouseEvent) => {
    e.preventDefault();
    submitMessage(`Let's continue our conversation`);
    router.push(`/chats/${user?.currentConversationId}`);
  };

  const handleStartConversation = async (e: React.MouseEvent) => {
    e.preventDefault();
    const id = v4();
    await createConversation({ id: id });
    router.push(`/chats/${id}`);
    submitMessage(`Let's start something new`);
  };

  if (isLoading) {
    return null;
  }
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="mb-4 rounded-lg border bg-background p-8">
        <h1 className="text-lg mb-2 font-semibold">Welcome to Tubesleuth!</h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          Start your content creation journey with us today:
        </p>
        <div className="mb-4 mt-4 flex flex-col items-start space-y-2">
          {!conversationId && !user?.currentConversationId ? (
            <>
              {exampleMessages.map((message, index) => (
                <Button
                  key={index}
                  variant="link"
                  className="h-auto p-0 text-base"
                  onClick={async () => {
                    submitMessage(message.message);
                  }}
                >
                  <ArrowRight className="mr-2 text-muted-foreground" />
                  {message.heading}
                </Button>
              ))}
            </>
          ) : (
            <>
              <Button
                variant="link"
                className="h-auto p-0 text-base"
                onClick={handleStartConversation}
              >
                <ArrowRight className="mr-2 text-muted-foreground" />
                Start a new conversation
              </Button>

              <Button
                variant="link"
                className="h-auto p-0 text-base"
                onClick={handleContinueConversation}
              >
                <ArrowRight className="mr-2 text-muted-foreground" />
                Continue your conversation
              </Button>

              <Button
                variant="link"
                className="h-auto p-0 text-base"
                onClick={() => submitMessage('Show me my content')}
              >
                <ArrowRight className="mr-2 text-muted-foreground" />
                Show me my content
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
