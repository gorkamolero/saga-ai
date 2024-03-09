import { cn } from '@/lib/utils';

export const AiMessage = ({
  children,
  isStreaming,
}: {
  children: React.ReactNode;
  isStreaming?: boolean;
}) => {
  return (
    <div
      className={cn(
        'sm:shadow-lg/40 sm:rounded-lg/2 rounded-md bg-white p-4 text-sm text-sm text-gray-600 shadow transition-all duration-300 sm:text-gray-800 sm:transition-none sm:duration-0',
      )}
    >
      {children}
    </div>
  );
};
