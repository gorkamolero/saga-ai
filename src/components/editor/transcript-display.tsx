import { useContext, useEffect, useRef, useState } from 'react';
import { EditorContext } from './editor-context';
import { type WordType } from '@/lib/validators/words';

interface Props {
  words: WordType[];
}

const adjustment = 0.1;

export const TranscriptDisplay: React.FC<Props> = ({ words }) => {
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  const { playerRef, seekTo, selectedAsset, saveAsset, currentTime } =
    useContext(EditorContext);

  useEffect(() => {
    if (!playerRef || !playerRef?.current) return;
    const onTimeUpdate = () => {
      if (!currentTime) return;

      const newActiveWordIndex = words.findIndex((word) => {
        // Convert start and end times to seconds before comparison
        const startInSeconds = word.start / 1000 - adjustment;
        const endInSeconds = word.end / 1000;
        return currentTime >= startInSeconds && currentTime < endInSeconds;
      });

      setActiveWordIndex(newActiveWordIndex);
    };

    const player = playerRef.current;
    player?.addEventListener('timeupdate', onTimeUpdate);

    // Return a cleanup function that checks if player is not null
    return () => {
      if (player) {
        player.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
  }, [words, currentTime, playerRef]);

  const [isStartClicked, setIsStartClicked] = useState(false);

  const handleWordClick = async (word: {
    text: string;
    start: number;
    end: number;
  }) => {
    if (selectedAsset) {
      let newStart = 0;
      let newEnd = 0;
      if (!isStartClicked) {
        // if word is first
        if (words[0] !== word) {
          newStart = word.start;
        }
        setIsStartClicked(true);
        console.log('selecting start', word.start);
      } else {
        newEnd = word.end;
        console.log('selecting end', word.end);

        if (word.start && word.end && saveAsset) {
          const updatedAsset = {
            ...selectedAsset,
            start: newStart,
            ...(newEnd && { end: newEnd }),
          };
          console.log('saving asset', updatedAsset);
          await saveAsset(updatedAsset);
          setIsStartClicked(false);
        }
      }
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap">
        {words.map((word, i) => (
          <button
            onClick={() => {
              if (seekTo) {
                seekTo(word.start / 1000);
              }
              handleWordClick(word);
            }}
            key={i}
            className={`word mx-1 ${
              activeWordIndex === i ? 'bg-yellow-200' : ''
            }`}
          >
            {word.text}
          </button>
        ))}
      </div>
    </div>
  );
};