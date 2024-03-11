'use client';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import { useContext } from 'react';
import { EditorContext } from './editor-context';
import { formatTime } from '@/lib/utils';
import { type VideoType } from '@/server/api/routers/videos';

export const Player = ({ video }: { video: VideoType }) => {
  const { isPlaying, togglePlay, duration, currentTime, seekTo } =
    useContext(EditorContext);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const timelineWidth = e.currentTarget.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const newTime = (clickX / timelineWidth) * duration;
    if (seekTo) {
      seekTo(newTime);
    }
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div className="flex items-center gap-2">
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
        <div className="flex flex-col">
          <h4 className="text-sm font-medium">Your video</h4>
          {/* <p className="text-xs text-gray-500 dark:text-gray-400">
            {video?.description}
          </p> */}
        </div>
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
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </>
  );
};
