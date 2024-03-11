'use client';

import { AI } from '@/app/action';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit';
import { useActions, useUIState } from 'ai/rsc';
import { useEffect, useRef, useState } from 'react';
import { UserMessage } from './ui/user-message';
import { useParams } from 'next/navigation';

export const ChatInput = () => {
  const { conversationId } = useParams();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>();

  const { formRef, onKeyDown } = useEnterSubmit();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        if (
          e.target &&
          ['INPUT', 'TEXTAREA'].includes((e.target as any).nodeName)
        ) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (inputRef?.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef]);

  const onSubmit = async (e: any) => {
    e.preventDefault();

    // Blur focus on mobile
    if (window.innerWidth < 600) {
      e.target['message']?.blur();
    }

    const value = inputValue.trim();
    setInputValue('');
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
      const responseMessage = await submitUserMessage({
        message: value,
        conversationId: conversationId as string,
      });
      setMessages((currentMessages) => [...currentMessages, responseMessage]);
    } catch (error) {
      // You may want to show a toast or trigger an error state.
      console.error(error);
    }
  };

  return (
    <form className="h-full w-full" onSubmit={onSubmit} ref={formRef}>
      <div
        className="fixed bottom-0 z-40 flex w-full origin-bottom justify-center p-8"
        style={{
          height: 'var(--chat-input-height)',
        }}
      >
        <div className="relative z-10 flex min-h-12 w-full max-w-[500px] items-center justify-center gap-2 rounded-3xl bg-zinc-900 px-2 shadow-lg transition-all duration-300 sm:shadow-black/40">
          <div className="hidden items-center justify-center rounded-l-full sm:flex">
            <img
              alt="Avatar"
              width="32"
              height="32"
              className="relative flex shrink-0 rounded-full"
              src="https://vercel.com/api/www/avatar/p7viAYxh6bvecCdXcHhCqKKZ?s=64"
            />
          </div>
          <div className="relative flex w-full min-w-0 flex-1 items-center self-end border-zinc-600 pl-2 sm:border-l">
            <div
              className="relative flex h-fit min-h-full w-full items-center transition-all duration-300"
              style={{ height: '47px' }}
            >
              <label htmlFor="textarea-input" className="sr-only">
                Prompt
              </label>
              <div className="relative flex min-w-0 flex-1 self-start">
                <div className="pointer-events-none invisible -ml-[100%] min-w-[50%] flex-[1_0_50%] overflow-x-visible opacity-0">
                  <div className="pointer-events-none invisible w-full opacity-0">
                    I have an idea...
                  </div>
                </div>
                <input
                  autoFocus
                  id="v0-main-input"
                  maxLength={1000}
                  minLength={2}
                  className="text-sm w-full min-w-[50%] flex-[1_0_50%] resize-none border-0 bg-transparent py-2.5 pr-2 leading-relaxed text-white shadow-none outline-none ring-0 [scroll-padding-block:0.75rem] selection:bg-teal-300 selection:text-black placeholder:text-zinc-400 disabled:bg-transparent disabled:opacity-80 sm:py-3"
                  placeholder="I have an idea..."
                  spellCheck={false}
                  style={{
                    colorScheme: 'dark',
                    height: '47px !important',
                  }}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <button
                  className="text-sm flex h-[28px] w-[28px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-transparent font-medium text-white transition-colors hover:bg-gray-800 focus-visible:bg-gray-800 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  type="submit"
                  id="send-button"
                  data-state="closed"
                />
              </div>
            </div>
          </div>
          <div className="flex h-full items-center gap-2 border-l border-zinc-600 pl-2">
            <button
              id="refine-button"
              className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-zinc-600 text-zinc-300 outline-none ring-offset-1 ring-offset-zinc-900 transition-colors hover:bg-zinc-800 hover:text-zinc-50 focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:opacity-50"
              data-state="closed"
              type="submit"
            >
              <span className="sr-only">Send</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.5 3V2.25H15V3V10C15 10.5523 14.5522 11 14 11H3.56062L5.53029 12.9697L6.06062 13.5L4.99996 14.5607L4.46963 14.0303L1.39641 10.9571C1.00588 10.5666 1.00588 9.93342 1.39641 9.54289L4.46963 6.46967L4.99996 5.93934L6.06062 7L5.53029 7.53033L3.56062 9.5H13.5V3Z"
                  fill="currentColor"
                ></path>
              </svg>
              <span className="sr-only">Edit</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
