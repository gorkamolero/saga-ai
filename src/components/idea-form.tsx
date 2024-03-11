'use client';

import { z } from 'zod';
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
import { type AI } from '@/app/action';
import { useId, useState } from 'react';

const ideaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  conversationId: z.string(),
});

export type IdeaInput = z.infer<typeof ideaSchema>;

export function IdeaForm({
  title: upstreamTitle,
  description: upstreamDescription,
  conversationId,
}: z.input<typeof ideaSchema>) {
  const [description, setDescription] = useState(upstreamDescription || '');
  const [title, setTitle] = useState(upstreamTitle || '');
  const [ideaUI, setIdeaUI] = useState<null | React.ReactNode>(null);

  const [history, setHistory] = useAIState<typeof AI>();
  const [, setMessages] = useUIState<typeof AI>();

  const { saveIdea } = useActions<typeof AI>();

  const titleId = useId();

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    const info = {
      role: 'system' as const,
      content: `[User has changed the title of his idea to "${newTitle}"]`,
    };

    // If last history state is already this info, update it. This is to avoid
    // adding every input change to the history.
    if (history[history.length - 1]?.id === titleId) {
      setHistory([...history.slice(0, -1), info]);
      return;
    }

    // If it doesn't exist, append it to history.
    setHistory([...history, info]);
  };

  const descriptionId = useId();

  const handleChangeDescription = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newDescription = e.target.value;
    setDescription(newDescription);

    const info = {
      role: 'system' as const,
      content: `[User has changed the description of his idea to "${newDescription}"]`,
    };

    if (history[history.length - 1]?.id === descriptionId) {
      setHistory([...history.slice(0, -1), info]);
      return;
    }

    setHistory([...history, info]);
  };

  const handleSave = async () => {
    const response = await saveIdea({ title, description, conversationId });
    setIdeaUI(response.ideaUI);

    // Insert messages
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: Date.now() + 1, display: response.whatsNext },
    ]);
  };

  return ideaUI ? (
    ideaUI
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>New idea</CardTitle>
        <CardDescription>Let's save it and develop it</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id={titleId}
            name="title"
            className={'w-full text-foreground/70'}
            placeholder="Title"
            value={title}
            onChange={handleChangeTitle}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id={descriptionId}
            name="description"
            className="min-h-[280px] text-foreground/70"
            placeholder="Description"
            value={description}
            onChange={handleChangeDescription}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="button" onClick={handleSave} className="my-3">
          Send it!
        </Button>
      </CardFooter>
    </Card>
  );
}
