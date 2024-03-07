"use client";

import { useChat } from "ai/react";

import { AiMessage } from "./ui/ai-message";
import { UserMessage } from "./ui/user-message";
import { ChatInput } from "./ChatInput";
import { useEffect, useRef, useState } from "react";

export function Chat() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onFinish: () => {
      setIsStreaming(false);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  });

  const handleStart = (e: React.FormEvent<HTMLFormElement>) => {
    setIsStreaming(true);
    handleSubmit(e);
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
            {messages.map((m, index) => (
              <li key={index} className="mt-4">
                {m.role === "user" ? (
                  <UserMessage>{m.content}</UserMessage>
                ) : (
                  <AiMessage
                    isStreaming={index === messages.length - 1 && isStreaming}
                  >
                    {m.content}
                  </AiMessage>
                )}
              </li>
            ))}
          </ul>

          <div className="scroller" ref={scrollRef} />
        </div>
      </div>

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleStart}
      />
    </div>
  );
}
