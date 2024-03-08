import { Button } from "@/components/ui/button";
// import { ExternalLink } from "@/components/external-link";
import { ArrowRight } from "lucide-react";

const exampleMessages = [
  {
    heading: "I have an idea",
    message: "I have an idea",
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
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="mb-4 rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">Welcome to Tubesleuth!</h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          Start your content creation journey with us today:
        </p>
        <div className="mb-4 mt-4 flex flex-col items-start space-y-2">
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
        </div>
      </div>
    </div>
  );
}
