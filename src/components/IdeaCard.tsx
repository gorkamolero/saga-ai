"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function IdeaCard({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle
          className={cn(
            "text-xl text-foreground/70",
            !!description && "text-2xl",
          )}
        >
          {title}
        </CardTitle>
      </CardHeader>
      {description && <CardContent>{description}</CardContent>}
    </Card>
  );
}
