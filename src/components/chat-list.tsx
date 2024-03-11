import { ChatScrollAnchor } from '@/lib/hooks/chat-scroll-anchor';

export function ChatList({ messages }: { messages: any[] }) {
  if (!messages.length) {
    return null;
  }

  return (
    <ul
      className="flex max-w-lg flex-col space-y-4 p-6"
      style={{
        paddingBottom: 'var(--chat-input-height)',
      }}
    >
      {messages.map((message, index) => (
        <li key={index} className="mt-4">
          {message.display}
        </li>
      ))}
      <ChatScrollAnchor trackVisibility />
    </ul>
  );
}
