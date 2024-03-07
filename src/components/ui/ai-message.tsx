import { cn } from "@/lib/utils";

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
        "sm:shadow-lg/40 sm:rounded-lg/2 rounded-md bg-white p-4 text-sm text-gray-600 shadow transition-all duration-300 sm:text-base sm:text-gray-800 sm:shadow-black/40 sm:transition-none sm:duration-0",
        isStreaming && "shadow-xs pb-4",
      )}
      style={
        isStreaming
          ? {
              background:
                "linear-gradient(to bottom, transparent 0%, transparent 50%, hsla(var(--card) / 1) 100%)",
            }
          : {}
      }
    >
      {children}
    </div>
  );
};
