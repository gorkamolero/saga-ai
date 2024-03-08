"use client";

import { UserMessage } from "./ui/user-message";
import { ChatInput } from "./ChatInput";
import { useEffect, useRef, useState } from "react";
import { useActions, useUIState } from "ai/rsc";
import { AI } from "@/app/action";
import { EmptyScreen } from "./EmptyChatScreen";
import { ChatScrollAnchor } from "@/lib/hooks/chat-scroll-anchor";

export function Chat() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  });

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex h-full flex-col">
        <div className="flex flex-grow flex-col space-y-4 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyScreen
              submitMessage={async (message) => {
                // Add user message UI
                setMessages((currentMessages) => [
                  ...currentMessages,
                  {
                    id: Date.now(),
                    display: <UserMessage>{message}</UserMessage>,
                  },
                ]);

                // Submit and get response message
                const responseMessage = await submitUserMessage(message);
                setMessages((currentMessages) => [
                  ...currentMessages,
                  responseMessage,
                ]);
              }}
            />
          ) : (
            <ul
              className="flex flex-col space-y-4 p-6"
              style={{
                paddingBottom: "var(--chat-input-height)",
              }}
            >
              {messages.map((m, index) => {
                return (
                  <li key={index} className="mt-4">
                    {m.display}
                  </li>
                );
              })}
            </ul>
          )}

          <ChatScrollAnchor trackVisibility />
        </div>
      </div>

      <ChatInput
        input={inputValue}
        handleInputChange={(e) => setInputValue(e.target.value)}
        handleSubmit={async (e: any) => {
          e.preventDefault();

          // Blur focus on mobile
          if (window.innerWidth < 600) {
            e.target["message"]?.blur();
          }

          const value = inputValue.trim();
          setInputValue("");
          if (!value) return;

          // Add user message UI
          setMessages((currentMessages) => [
            ...currentMessages,
            {
              id: Date.now(),
              display: <UserMessage>{value}</UserMessage>,
            },
          ]);

          try {
            // Submit and get response message
            const responseMessage = await submitUserMessage(value);
            setMessages((currentMessages) => [
              ...currentMessages,
              responseMessage,
            ]);
          } catch (error) {
            // You may want to show a toast or trigger an error state.
            console.error(error);
          }
        }}
      />
    </div>
  );
}
