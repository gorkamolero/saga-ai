import { VisualAssetType } from '@/server/api/routers/assets';
import { api } from '@/trpc/react';
import React, { createContext, useState, useRef, useEffect } from 'react';

interface TranscriptContextProps {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  togglePlay: () => void;
  playerRef: React.RefObject<HTMLAudioElement | HTMLVideoElement> | null;
  seekTo?: (time: number) => void;
  isSelectingAsset: boolean;
  setIsSelectingAsset: (isSelectingAsset: boolean) => void;
  saveAsset: (asset: VisualAssetType) => Promise<any>;
  selectedAsset?: VisualAssetType | null;
  setSelectedAsset?: (asset: VisualAssetType) => void;
}

export const TranscriptContext = createContext<TranscriptContextProps>({
  isPlaying: false,
  setIsPlaying: () => {},
  currentTime: 0,
  setCurrentTime: () => {},
  duration: 0,
  togglePlay: () => {},
  playerRef: null,
  seekTo: () => {},
  isSelectingAsset: false,
  setIsSelectingAsset: () => {},
  saveAsset: async () => {},
  selectedAsset: null,
  setSelectedAsset: () => {},
});

export const TranscriptProvider: React.FC<{
  children: React.ReactNode;
  src: string;
}> = ({ children, src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);

  useEffect(() => {
    const audio = playerRef.current;

    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio) {
        setDuration(audio.duration);
      }
    };

    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    }

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
  }, []);

  const seekTo = (time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  /*
  Asset work
  */

  const [selectedAsset, setSelectedAsset] = useState<VisualAssetType | null>(
    null,
  );
  const [isSelectingAsset, setIsSelectingAsset] = useState(false);
  useEffect(() => {
    if (isSelectingAsset && playerRef.current) {
      playerRef.current.pause();
      setIsPlaying(false);
    }
  }, [isSelectingAsset]);

  const { mutate: mutateAsset } = api.assets.update.useMutation();
  const saveAsset = async (asset: VisualAssetType) => {
    if (!asset.id) {
      console.error('Asset ID is undefined.');
      return;
    }
    await mutateAsset({
      ...asset,
      id: asset.id as string,
    });
  };

  const [selectedAssetStart, setSelectedAssetStart] = useState<number | null>(
    null,
  );
  const [selectedAssetEnd, setSelectedAssetEnd] = useState<number | null>(null);

  return (
    <TranscriptContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        duration,
        togglePlay,
        playerRef,
        seekTo,
        isSelectingAsset,
        setIsSelectingAsset,
        saveAsset,
        selectedAsset,
        setSelectedAsset,
      }}
    >
      {children}
      <audio ref={playerRef} src={src} className="hidden" />
    </TranscriptContext.Provider>
  );
};
