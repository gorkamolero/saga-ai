import React, { useContext, useEffect, useState } from 'react';
import { EditorContext } from './editor-context';
import { type WordType } from '@/lib/validators/words';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { PanInfo, animate, motion } from 'framer-motion';

interface Props {
  words: WordType[];
}

const adjustment = 100;

export const TranscriptDisplay: React.FC<Props> = ({ words }) => {
  const { playerRef, seekTo, selectedAsset, saveAsset, currentTime } =
    useContext(EditorContext);

  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  const [selectedStart, setSelectedStart] = useState<number>(0);
  const [selectedEnd, setSelectedEnd] = useState<number>(0);
  useEffect(() => {
    if (selectedAsset) {
      if (
        !selectedAsset ||
        selectedAsset.start === undefined ||
        selectedAsset.end === undefined ||
        selectedAsset.start === null ||
        selectedAsset.end === null
      ) {
        return;
      }
      setSelectedStart(selectedAsset.start);
      setSelectedEnd(selectedAsset.end);
    }
  }, [selectedAsset]);

  const isWordInRange = (word: WordType) => {
    const wordStart = word.start;
    const wordEnd = word.end;
    return wordStart >= selectedStart && wordEnd <= selectedEnd;
  };

  useEffect(() => {
    if (!playerRef || !playerRef?.current) return;

    const onTimeUpdate = () => {
      if (!currentTime) return;
      const newActiveWordIndex = words.findIndex((word) => {
        const startInSeconds = word.start - adjustment;
        const endInSeconds = word.end;
        return currentTime >= startInSeconds && currentTime < endInSeconds;
      });
      setActiveWordIndex(newActiveWordIndex);
    };

    const player = playerRef.current;
    player?.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      if (player) {
        player.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
  }, [words, currentTime, playerRef]);

  const transcriptRef = React.useRef<HTMLDivElement>(null);

  const handleMarkerDrag = async (info: PanInfo, isStartHandle: boolean) => {
    const x = info.point.x;
    const y = info.point.y;

    // console.log('YOLO', x, y);
    // Find element above which this is dragging,

    let wordAtIndex: WordType | undefined = undefined;
    let index: number | undefined = undefined;

    const allElementsAtXY = document.elementsFromPoint(x, y);
    const validEls = allElementsAtXY.find(
      (el) =>
        el.classList.contains('word') || el.classList.contains('choose-next'),
    );

    let wordEl: Element | null = null;

    const isWord = validEls?.classList.contains('word');
    if (isWord) {
      wordEl = validEls as Element;
    }

    const isChooseNext = validEls?.classList.contains('choose-next');
    if (isChooseNext) {
      if (!validEls || !validEls?.nextElementSibling) {
        throw new Error('No next element found');
      }
      wordEl = isStartHandle
        ? validEls?.nextElementSibling
        : validEls?.previousElementSibling;
    }

    if (!wordEl) {
      throw new Error('No word element found');
    }
    // and find the word index of that element

    const indexStr = wordEl.getAttribute('data-index');
    if (indexStr) {
      index = parseInt(indexStr);
      wordAtIndex = words.find((word) => word.index === index);
    }

    if (!wordAtIndex || index === undefined) {
      throw new Error('No word found');
    }

    // and then update the start or end time of the selected asset
    if (selectedAsset) {
      if (isStartHandle) {
        setSelectedStart(wordAtIndex.start);
        await saveAsset({
          id: selectedAsset.id,
          start: wordAtIndex.start,
          startWordIndex: wordAtIndex.index,
        });
        console.log('SAVED', wordAtIndex.index);
      } else {
        setSelectedEnd(wordAtIndex.end);
        await saveAsset({
          id: selectedAsset.id,
          end: wordAtIndex.end,
          endWordIndex: wordAtIndex.index,
        });
      }
    }

    // TODO: SNAP
  };

  return (
    <div className="relative">
      <div
        className="transcript-box flex-start relative flex h-full flex-wrap items-stretch -space-x-[0] overflow-y-auto p-4"
        ref={transcriptRef}
      >
        {words.map((word, i) => (
          <React.Fragment key={i}>
            <div className="choose-next w-3" />
            {selectedAsset?.start === word.start && (
              <Separator
                asChild
                orientation="vertical"
                className="start-handle h-6 w-1 cursor-ew-resize bg-black p-1"
              >
                <motion.div
                  whileDrag={{ scale: 1.4 }}
                  dragConstraints={transcriptRef}
                  drag
                  onDragEnd={(_, info) => handleMarkerDrag(info, true)}
                />
              </Separator>
            )}
            <button
              onClick={() => {
                if (seekTo) {
                  seekTo(word.start);
                }
              }}
              className={cn(
                'word mx-1 select-none',
                activeWordIndex === i ? 'bg-yellow-200' : '',
                isWordInRange(word) ? 'bg-green-200' : '',
              )}
              data-index={i}
            >
              {word.text.trim()}
            </button>
            {selectedAsset?.end === word.end && (
              <motion.div
                whileDrag={{ scale: 1.4 }}
                dragConstraints={transcriptRef}
                drag
                onDragEnd={(_, info) => handleMarkerDrag(info, false)}
              >
                <Separator
                  orientation="vertical"
                  className="end-handle h-6 w-1 cursor-ew-resize bg-red-900 p-1"
                />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
