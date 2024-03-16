'use client';

import { AI } from '@/app/action';
import { useAIState, useActions, useUIState } from 'ai/rsc';
import { AudioSelector } from '@/components/audio-selector';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { VOICEMODELS } from '@/lib/validators';

export const VoiceModelSelector = ({ scriptId }: { scriptId: string }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useAIState<typeof AI>();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>();

  const onyx = 'onyx' as VOICEMODELS;
  const [selectedVoiceModel, setSelectedVoiceModel] =
    useState<VOICEMODELS>(onyx);

  const handleSelectModel = async () => {
    setLoading(true);

    setHistory([
      ...history,
      {
        role: 'system',
        content: `[The user has selected the voice model "${selectedVoiceModel}"]`,
      },
      {
        role: 'assistant',
        content: `Great! I'm ready to generate a voiceover for your script using the "${selectedVoiceModel}" voice model. shall I continue?`,
      },
      {
        role: 'user',
        content: `Please, go ahead and generate a voiceover for my script using the "${selectedVoiceModel}" voice model.`,
      },
    ]);

    const responseMessage = await submitUserMessage({
      message: `I choose "${selectedVoiceModel}" voice model.`,
      conversationId: scriptId as string,
    });

    setMessages([...messages, responseMessage]);

    setLoading(false);
  };

  return (
    <div className="flex w-full max-w-md flex-col items-stretch space-y-6">
      <AudioSelector
        selectedTrack={selectedVoiceModel}
        setSelectedTrack={(value) => {
          setSelectedVoiceModel(value as VOICEMODELS);
        }}
      />

      <div className="flex justify-end space-x-4">
        <Button onClick={handleSelectModel} disabled={loading}>
          Select model
        </Button>
      </div>
    </div>
  );
};
