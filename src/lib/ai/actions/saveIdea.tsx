import 'server-only';

import { getMutableAIState } from 'ai/rsc';
import { AiMessage } from '@/components/ui/ai-message';
import { ContentCard } from '@/components/content-card';
import { AI } from '../../../app/action';
import { v4 } from 'uuid';
import { api } from '@/trpc/server';

const nextActions = [`Let's generate a script`];

export async function saveIdea({
  title,
  description,
  conversationId,
}: {
  title: string;
  description: string;
  conversationId: string;
}) {
  'use server';
  const aiState = getMutableAIState<typeof AI>();

  const id = v4();

  const ideaUI = (
    <>
      <ContentCard title={title} description={description} />
    </>
  );

  const whatsNext = (
    <div className="grid gap-2">
      <AiMessage>Good. Do you want to create a script for it?</AiMessage>
    </div>
  );

  await api.ideas.createIdea.mutate({
    id,
    title,
    description,
  });

  await api.conversations.set.mutate({
    id: conversationId,
    ideaId: id,
  });

  aiState.done([
    ...aiState.get(),
    {
      role: 'system',
      content: `[The user has saved a new idea with title "${title}" and description "${description}" with id: ${id}]. If the user asks about this idea, you can tell him any information about it.`,
    },
    {
      role: 'assistant',
      content: `Congratulations! Your idea "${title}" has been saved successfully. Do you want to create a script for it?`,
    },
  ]);

  return {
    ideaUI,
    whatsNext,
  };
}
