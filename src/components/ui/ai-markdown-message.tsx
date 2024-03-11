import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';

export const AiMarkdownMessage = ({
  children,
  isStreaming,
}: {
  children: string;
  isStreaming?: boolean;
}) => {
  return (
    <div
      className={cn(
        'sm:shadow-lg/40 sm:rounded-lg/2 text-sm text-sm grid gap-2 rounded-md bg-white p-4 text-gray-600 shadow transition-all duration-300 sm:text-gray-800 sm:transition-none sm:duration-0',
      )}
    >
      <Markdown>{children}</Markdown>
    </div>
  );
};
