'use client';

import { useState } from 'react';
import { useAIState, useActions, useUIState } from 'ai/rsc';
import { Textarea } from './ui/textarea';
import { TextGenerateEffect } from './ui/text-generate-fx';
import { Button } from './ui/button';
import { Edit, Lock, Save } from 'lucide-react';
import { api } from '@/trpc/react';
import { v4 } from 'uuid';
import { AI } from '@/app/action';
import { AiMessage } from './ui/ai-message';

export const ScriptForm = ({
  script: initialScript,
  title,
}: {
  script: string;
  title: string;
}) => {
  const [editMode, setEditMode] = useState(false);
  const [script, setScript] = useState<string | null>(initialScript);

  const { mutate: saveScript, isLoading } =
    api.scripts.createOrUpdate.useMutation();
  const { mutate: updateCurrentConversation } =
    api.conversations.updateCurrent.useMutation();

  const [history, setHistory] = useAIState<typeof AI>();
  const [, setMessages] = useUIState<typeof AI>();

  const handleChangeScript = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newScript = e.target.value;
    setScript(newScript);
  };

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = v4() as string;
    if (script) {
      try {
        await saveScript({ id, script });

        await updateCurrentConversation({ scriptId: id });

        const response = {
          whatsNext: (
            <AiMessage>
              <p>Would you like to generate a voiceover?</p>
            </AiMessage>
          ),
        };

        setMessages((currentMessages) => [
          ...currentMessages,
          { id: Date.now() + 1, display: response.whatsNext },
        ]);

        setHistory([
          ...history,
          {
            role: 'system',
            content: `[User has saved the script with id ${id} with the following content: "${script}"]`,
          },
        ]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="grid gap-2">
      {editMode ? (
        <div className="relative">
          <Textarea
            autoResize
            value={script || ''}
            onChange={handleChangeScript}
          />
        </div>
      ) : (
        <TextGenerateEffect words={script || ''} />
      )}

      <div className="mt-6 flex w-full items-center justify-between">
        <div className="flex w-full items-center justify-end space-x-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? <Lock /> : <Edit />}
          </Button>
          {editMode ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handleSave}
              disabled={!editMode}
            >
              <Save />
            </Button>
          ) : (
            <Button variant="outline" onClick={handleSave} disabled={isLoading}>
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
