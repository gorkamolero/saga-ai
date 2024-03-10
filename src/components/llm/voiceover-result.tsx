'use client';

import { Button } from '../ui/button';
import { api } from '@/trpc/react';
import { redirect } from 'next/navigation';
import { AiMessage } from '../ui/ai-message';

export const VoiceoverResult = ({ url }: { url: string | undefined }) => {
  const {
    mutate: createVideo,
    data,
    isLoading,
  } = api.videos.create.useMutation();

  const { mutate: updateCurrentConversation } =
    api.conversations.updateCurrent.useMutation();

  const handleSaveVideo = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await createVideo();
      if (data) {
        await updateCurrentConversation({ videoId: data.id });
        redirect(`/videos/${data.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid gap-2">
      <AiMessage>
        <p>Here is the generated voiceover.</p>

        <audio controls src={url} />
      </AiMessage>

      <AiMessage>
        <p>We have reached the last step. Now let's generate the video</p>

        <div className="flex items-end">
          <Button onClick={handleSaveVideo} disabled={isLoading}>
            Generate video
          </Button>
        </div>
      </AiMessage>
    </div>
  );
};
