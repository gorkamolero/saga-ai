'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAIState, useActions, useUIState } from 'ai/rsc';
import { AI } from '@/app/action';
import { talentHunter } from '@/lib/prompts/system-prompt';
import { api } from '@/trpc/react';
import { ContentCard } from './ContentCard';
import { AiMessage } from './ui/ai-message';

const ideaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

export type IdeaInput = z.infer<typeof ideaSchema>;

export function IdeaFormCard({
  title: upstreamTitle,
  description: upstreamDescription,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
}) {
  const { mutate: saveIdea, isLoading } =
    api.ideas.createIdeaWithTitleAndDescription.useMutation();

  const [, setAiState] = useAIState<typeof AI>();
  const [, setMessages] = useUIState<typeof AI>();

  const form = useForm<IdeaInput>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      title: (upstreamTitle as unknown as string) || '',
      description: (upstreamDescription as unknown as string) || '',
    },
  });

  const onSubmit = async (data: IdeaInput) => {
    try {
      await saveIdea(data);

      setAiState((state) => {
        return [
          ...state,
          {
            role: 'assistant' as const,
            content: `Congratulations! Your idea "${data.title}" has been saved successfully.`,
          },
          {
            role: 'assistant' as const,
            content: `Now let's develop it into a full-fledged script. Tell me, what style of writing do you prefer? Get creative`,
          },
        ];
      });

      // Update the UI state with the new messages
      setMessages((currentMessages) => [
        ...currentMessages.slice(0, -1),
        {
          id: Date.now(),
          display: (
            <ContentCard title={data.title} description={data.description} />
          ),
        },
        {
          id: Date.now() + 1,
          display: (
            <AiMessage>
              <p className="text-sm text-gray-600">
                Congratulations! Your idea "{data.title}" has been saved
                successfully.
              </p>
            </AiMessage>
          ),
        },
        {
          id: Date.now() + 2,
          display: (
            <AiMessage>
              <p className="text-sm text-gray-600">
                Now let's develop it into a full-fledged script. Tell me, what
                style of writing do you prefer? Get creative
              </p>
            </AiMessage>
          ),
        },
      ]);
    } catch (error) {
      console.error(error);
    }
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
              {...form.register('title')}
              className={'w-full text-foreground/70'}
              placeholder="Title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...form.register('description')}
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
