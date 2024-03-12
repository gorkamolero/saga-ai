'use client';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import { useContext } from 'react';
import { EditorContext } from './editor-context';
import { formatTime } from '@/lib/utils';

export const Player = () => {
  const { isPlaying, togglePlay, duration, currentTime, seekTo } =
    useContext(EditorContext);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekTo) return;
    const timelineWidth = e.currentTarget.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    // Ensure newTime is calculated in seconds, matching the duration unit
    const newTimeInSeconds = (clickX / timelineWidth) * duration;
    seekTo(newTimeInSeconds);
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex w-full items-center justify-start border-t">
      <div className="flex items-center gap-2 px-8">
        <Button size="icon" variant="ghost" onClick={togglePlay}>
          {isPlaying ? (
            <>
              <Pause className="h-6 w-6" />
              <span className="sr-only">Pause</span>
            </>
          ) : (
            <>
              <Play className="h-6 w-6" />
              <span className="sr-only">Play</span>
            </>
          )}
        </Button>
      </div>
      <div
        onClick={handleTimelineClick}
        className="mx-4 h-1 flex-1 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700"
      >
        <div
          className="h-full bg-gray-900 dark:bg-gray-300"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>
      <div className="text-xs px-8 text-gray-500 dark:text-gray-400">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
};
