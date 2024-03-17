'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardTitle } from './ui/card';

export function ContentCard({
  title,
  description,
  xtra,
  className,
  hoverFx = true,
  ...props
}: {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  xtra?: React.ReactNode;
  className?: string;
  hoverFx?: boolean;
}) {
  return (
    <Card
      className={cn(
        `group/cards aspect-square max-w-64 rounded-lg border border-primary bg-white p-8 text-primary shadow ring-offset-background  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
        className,
      )}
      {...props}
    >
      {title && (
        <CardTitle className="text-2xl mb-4 whitespace-pre-line font-bold transition duration-200 ">
          {title}
        </CardTitle>
      )}
      {description && (
        <CardDescription
          className={cn(
            'text-sm whitespace-pre-line ',
            hoverFx &&
              'transition duration-200 group-hover/cards:translate-x-2',
          )}
        >
          {description}
        </CardDescription>
      )}
      {xtra && <CardContent>{xtra}</CardContent>}
    </Card>
  );
}
