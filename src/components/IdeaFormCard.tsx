"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ideaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

export type IdeaInput = z.infer<typeof ideaSchema>;

export function IdeaFormCard({
  title: upstreamTitle,
  description: upstreamDescription,
}: {
  title?: string;
  description?: string;
}) {
  const { mutate: addIdea, isLoading } =
    api.ideas.createIdeaWithTitleAndDescription.useMutation();

  const form = useForm<IdeaInput>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      title: upstreamTitle || "",
      description: upstreamDescription || "",
    },
  });

  const onSubmit = async (data: IdeaInput) => {
    await addIdea(data);
  };

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)} className="min-w-[24rem]">
        <CardHeader>
          <CardTitle>New idea</CardTitle>
          <CardDescription>Let's save it and develop it</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              {...form.register("title")}
              className={cn("text-foreground/70")}
              placeholder="Title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...form.register("description")}
              className="min-h-[280px] text-foreground/70"
              placeholder="Description"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="my-3">
            Send it!
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
