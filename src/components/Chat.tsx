'use client';

import { UserMessage } from './ui/user-message';
import { ChatInput } from './chat-input';
import { useEffect, useRef, useState } from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { AI } from '@/app/action';
import { EmptyScreen } from './EmptyChatScreen';
import { ChatScrollAnchor } from '@/lib/hooks/chat-scroll-anchor';
import { ChatList } from './chat-list';
import ScriptWriter from './llm/full-script-writer';

export function Chat() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }
  });

  return (
    <div className="flex h-full w-screen flex-1 flex-col">
      <div className="flex h-full flex-col">
        <div className="max-w-screen flex flex-grow flex-col items-center space-y-4 overflow-y-auto">
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
            <ChatList messages={messages} />
          )}

          <ChatScrollAnchor trackVisibility />
        </div>
      </div>

      <ChatInput />
    </div>
  );
}
