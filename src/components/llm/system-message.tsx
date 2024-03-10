export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        'text-xs mt-2 flex items-center justify-center gap-2 text-gray-500'
      }
    >
      <div className={'max-w-[600px] flex-initial px-2 py-2'}>{children}</div>
    </div>
  );
}
