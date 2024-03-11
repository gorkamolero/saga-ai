'use client';

import { useEffect, useState } from 'react';
import { api } from '@/trpc/react';
import { Button } from '../ui/button';
import { useActions, useUIState } from 'ai/rsc';
import { type AI } from '@/app/action';
import { ContentCard } from '../content-card';
import { LoadingSpinner } from '../ui/spinner';
import { cn } from '@/lib/utils';

export const ScriptWriter = () => {
  const { data: ideas, error } = api.ideas.getIdeas.useQuery();

  const [selectedIdeaID, setSelectedIdeaID] = useState('');
  const selectedIdea = ideas?.find((idea) => idea.id === selectedIdeaID);

  const [writerUI, setWriterUI] = useState<null | React.ReactNode>(null);

  const { writeScript } = useActions<typeof AI>();
  const [, setMessages] = useUIState<typeof AI>();

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedIdeaID(value);
  };

  useEffect(() => {
    if (ideas?.length) {
      ideas.sort((a, b) => {
        return a.createdAt < b.createdAt ? 1 : -1;
      });
      if (ideas[0]) setSelectedIdeaID(ideas[0].id);
    }
  }, [ideas]);

  if (error || !ideas) {
    return <ContentCard xtra={<LoadingSpinner size={48} />} />;
  }

  return (
    <div className="mb-8 flex w-screen flex-col gap-2 overflow-hidden">
      {writerUI ? (
        <div className="mx-auto max-w-md p-8">
          <div className="mt-4 text-zinc-200">{writerUI}</div>
        </div>
      ) : (
        <>
          <div className="relative flex h-[42rem] w-full flex-col items-end justify-end overflow-hidden">
            <div className="absolute top-0 mb-24 flex w-full space-x-8 overflow-x-auto whitespace-nowrap p-8">
              {ideas.map((idea) => (
                <label key={idea.id} className="flex-shrink-0 cursor-pointer">
                  <input
                    type="radio"
                    name="radio-card-group"
                    value={idea.id}
                    checked={selectedIdeaID === idea.id}
                    onChange={handleValueChange}
                    className="sr-only"
                    disabled={!idea.description}
                  />
                  <ContentCard
                    title={idea.title || ''}
                    description={idea.description || ''}
                    className={cn(
                      selectedIdeaID === idea.id ? 'bg-primary text-white' : '',
                    )}
                    hoverFx={false}
                  />
                </label>
              ))}
            </div>
            <div className="mx-auto mt-4 w-full max-w-md pb-8">
              <div className="flex items-end justify-end  p-8">
                <Button
                  size="lg"
                  onClick={async () => {
                    const ideaForScript = {
                      title: selectedIdea?.title || '',
                      description: selectedIdea?.description || '',
                      style: `Suspenseful, serious and captivating, akin to Borges and H. P. Lovecrafts's writing. Engage the listener with a mix of mistery and fact. Suit the style to the provided theme. Always include at least a fact or factoid`,
                    };
                    const response = await writeScript(ideaForScript);
                    setWriterUI(response.writerUI);

                    // Insert a new system message to the UI.
                    setMessages((currentMessages: any) => [
                      ...currentMessages,
                      response.newMessage,
                    ]);
                  }}
                  className="relative z-40"
                >
                  Create Script
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScriptWriter;
