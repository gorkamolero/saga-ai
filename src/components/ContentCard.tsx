'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardTitle } from './ui/card';

export function ContentCard({
  title,
  description,
  xtra,
  className,
  hoverFx = true,
}: {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  xtra?: React.ReactNode;
  className?: string;
  hoverFx?: boolean;
}) {
  return (
    <Card
      className={`group/cards aspect-square max-w-64 rounded-lg border border-primary bg-white p-8 text-primary shadow ring-offset-background  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {title && (
        <CardTitle className="mb-4 whitespace-pre-line text-2xl font-bold transition duration-200 ">
          {title}
        </CardTitle>
      )}
      {description && (
        <CardDescription
          className={cn(
            'whitespace-pre-line text-sm ',
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
