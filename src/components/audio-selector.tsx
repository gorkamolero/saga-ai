'use client';

import { useState, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { Pause } from 'lucide-react';

import { RadioGroupItem, RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { voicemodelAudios } from '@/lib/constants';

export interface Track {
  name: string;
  title: string;
  src: string;
  forceValue?: string;
}

interface TrackItemProps {
  track: Track;
  index: number;
}

interface AudioSelectorProps {
  title?: string;
  description?: string;
  tracks?: Track[];
  selectedTrack: string;
  setSelectedTrack: (value: string) => void;
}

export const AudioSelector = ({
  title = 'Select a voice model',
  description = 'Choose a voice that best fits your video.',
  tracks = voicemodelAudios,
  selectedTrack,
  setSelectedTrack,
}: AudioSelectorProps) => (
  <div className="grid gap-2">
    <p className="text-2xl">{title}</p>
    <p className="text-gray-500">{description}</p>
    <RadioGroup value={selectedTrack} onValueChange={setSelectedTrack}>
      {tracks.map((track, index) => (
        <TrackItem key={track.name} track={track} index={index} />
      ))}
    </RadioGroup>
  </div>
);

export const TrackItem: React.FC<TrackItemProps> = ({ track }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex items-center">
      <Button aria-label="Play" size="icon" onClick={togglePlay} type="button">
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      <audio ref={audioRef} src={track.src} className="hidden" />
      <RadioGroupItem
        className="peer sr-only"
        id={track.name}
        value={track.forceValue ? track.forceValue : track.name}
      />
      <Label
        className="text-sm grid flex-1 cursor-pointer gap-1 rounded-lg p-4 transition-colors peer-aria-checked:border-2"
        htmlFor={track.name}
      >
        <div className="font-medium">{track.title}</div>
      </Label>
    </div>
  );
};
