import { type FullVideoType } from '@/lib/validators/videos';
import { FPS } from '@/lib/constants';
import { convertMsToFrames } from '@/lib/utils/animations';
import { type VisualAssetType } from '@/server/api/routers/assets';
import { api } from '@/trpc/react';
import { type PlayerRef } from '@remotion/player';
import React, { createContext, useState, useRef, useEffect } from 'react';

interface EditorContextProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  playerRef: React.RefObject<PlayerRef> | null;
  seekTo?: (time: number) => void;
  isSelectingAsset: boolean;
  setIsSelectingAsset: (isSelectingAsset: boolean) => void;
  saveAsset: (asset: VisualAssetType) => Promise<any>;
  selectedAsset?: VisualAssetType | null;
  setSelectedAsset?: (asset: VisualAssetType) => void;
}

export const EditorContext = createContext<EditorContextProps>({
  isPlaying: false,
  currentTime: 0,
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

export const EditorProvider: React.FC<{
  children: React.ReactNode;
  video: FullVideoType;
}> = ({ children, video }) => {
  const playerRef = useRef<PlayerRef>(null);
  const player = playerRef.current;

  const isPlaying = player?.isPlaying() || false;
  const currentFrame = player?.getCurrentFrame();
  const currentTime = currentFrame ? currentFrame / FPS : 0;
  const duration = (video?.duration ?? 0);
  const seekTo = (time: number) => player?.seekTo(convertMsToFrames(time, FPS));
  const togglePlay = () => player?.toggle();

  /*
  Asset work
  */

  const [selectedAsset, setSelectedAsset] = useState<VisualAssetType | null>(
    null,
  );
  const [isSelectingAsset, setIsSelectingAsset] = useState(false);
  useEffect(() => {
    if (isSelectingAsset && playerRef.current) {
      player?.pause();
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
      id: asset.id,
    });
  };

  return (
    <EditorContext.Provider
      value={{
        isPlaying,
        currentTime,
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
    </EditorContext.Provider>
  );
};
