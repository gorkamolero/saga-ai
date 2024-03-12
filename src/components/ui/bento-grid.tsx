import { cn } from '@/lib/utils';

export const BentoGrid = ({
  className,
  children,
  horizontal = false,
}: {
  className?: string;
  children?: React.ReactNode;
  horizontal?: boolean;
}) => {
  return (
    <div className="overflow-x-auto overscroll-x-contain scroll-smooth">
      <div
        className={cn(
          'mx-auto grid max-w-7xl gap-4',
          horizontal
            ? 'h-full snap-x auto-cols-max grid-flow-col grid-rows-2'
            : 'md:auto-rows grid-cols-1 md:grid-cols-3',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  horizontal = false,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  horizontal?: boolean;
}) => {
  return (
    <div
      className={cn(
        'group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-transparent bg-white p-4 shadow-input transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none',
        horizontal ? 'h-full w-80 snap-center' : '',
        className,
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mb-2 mt-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {title}
        </div>
        <div className="text-xs font-sans font-normal text-neutral-600 dark:text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
};
