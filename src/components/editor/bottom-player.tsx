'use client';
import { Button } from '@/components/ui/button';
import { Pause, Play, SkipBack } from 'lucide-react';
import { useContext } from 'react';
import { EditorContext } from './editor-context';

export const timelineTime = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`;

export const Player = () => {
  const { isPlaying, togglePlay, duration, currentTime, seekTo } =
    useContext(EditorContext);
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        aria-label="Return to start"
        onClick={() => seekTo?.(0)}
      >
        <SkipBack className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="default"
        className="h-8 w-8"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <span
        className="text-xs ml-2 font-mono tabular-nums"
        data-testid="timeline-time"
      >
        {timelineTime(currentTime)}
        <span className="text-muted-foreground">
          .
          {Math.floor((currentTime % 1) * 100)
            .toString()
            .padStart(2, '0')}{' '}
          / {timelineTime(duration)}
        </span>
      </span>
    </div>
  );
};
