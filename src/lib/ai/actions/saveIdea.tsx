import 'server-only';

import { getMutableAIState } from 'ai/rsc';
import { AiMessage } from '@/components/ui/ai-message';
import { ContentCard } from '@/components/content-card';
import { type AI } from '../../../app/action';
import { api } from '@/trpc/server';

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

  const id = conversationId;

  const ideaUI = (
    <>
      <ContentCard
        className="max-w-128"
        title={title}
        description={description}
      />
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

  const aiStateUpdate = [
    ...aiState.get(),
    {
      role: 'system' as 'function' | 'user' | 'system' | 'assistant',
      content: `[The user has saved a new idea with title "${title}" and description "${description}" with id: ${id}]. If the user asks about this idea, you can tell him any information about it.`,
    },
    {
      role: 'assistant' as 'function' | 'user' | 'system' | 'assistant',
      content: `Congratulations! Your idea "${title}" has been saved successfully. Do you want to create a script for it?`,
    },
  ];
  aiState.done(aiStateUpdate);
  await api.conversations.updateAiState.mutate({
    id: conversationId,
    aiState: aiStateUpdate,
  });

  return {
    ideaUI,
    whatsNext,
  };
}
