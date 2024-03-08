"use client";

import { useChat } from "ai/react";

import { AiMessage } from "./ui/ai-message";
import { UserMessage } from "./ui/user-message";
import { ChatInput } from "./ChatInput";
import { useEffect, useRef, useState } from "react";
import { useAIState, useActions, useUIState } from "ai/rsc";
import { AI } from "@/app/action";

export function Chat() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useUIState<typeof AI>();
  const [aiState, setAiState] = useAIState<typeof AI>();
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsStreaming(true);

    // Add user message to UI state
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        display: <div>{inputValue}</div>,
      },
    ]);

    // Submit and get response message
    const responseMessage = await submitUserMessage(inputValue);
    setMessages((currentMessages) => [...currentMessages, responseMessage]);

    setInputValue("");
    setIsStreaming(false);
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex h-full flex-col">
        <div className="flex flex-grow flex-col space-y-4 overflow-y-auto">
          <ul
            className="flex flex-col space-y-4 p-6"
            style={{
              paddingBottom: "var(--chat-input-height)",
            }}
          >
            {messages.map((m, index) => {
              const atState = aiState[index];
              console.log(atState);
              return (
                <li key={index} className="mt-4">
                  {atState?.role === "user" ? (
                    <UserMessage>{m.display}</UserMessage>
                  ) : (
                    <AiMessage
                      isStreaming={index === messages.length - 1 && isStreaming}
                    >
                      {m.display}
                    </AiMessage>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="scroller" ref={scrollRef} />
        </div>
      </div>

      <ChatInput
        input={inputValue}
        handleInputChange={(e) => setInputValue(e.target.value)}
        handleSubmit={onSubmit}
      />
    </div>
  );
}
