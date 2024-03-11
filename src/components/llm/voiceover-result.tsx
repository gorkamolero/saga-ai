'use client';

import { AiMessage } from '../ui/ai-message';

export const VoiceoverResult = ({ url }: { url: string | undefined }) => {
  return (
    <div className="grid gap-2">
      <AiMessage>
        <p>Here is the generated voiceover.</p>

        <audio controls src={url} />
      </AiMessage>
    </div>
  );
};
