import { type FullVideoType } from '@/lib/validators/videos';
import { FPS } from '@/lib/constants';
import { type VisualAssetType } from '@/server/api/routers/assets';
import { api } from '@/trpc/react';
import { type PlayerRef } from '@remotion/player';
import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';

interface EditorContextProps {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
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
  setIsPlaying: () => {},
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
  const [player, setPlayer] = useState<PlayerRef | null>(null);
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (playerRef.current) {
      setPlayer(playerRef.current);
    }
  }, []);

  const duration = video?.duration ?? 0;

  useEffect(() => {
    if (player) {
      // Handler for the timeupdate event
      const handleTimeUpdate = (e: { detail: { frame: number } }) => {
        const currentFrame = e.detail.frame;
        const currentTimeInSeconds = currentFrame / FPS;
        // Assuming setCurrentTime is implemented
        setCurrentTime(currentTimeInSeconds);
      };

      // Add event listener for timeupdate
      player.addEventListener('timeupdate', handleTimeUpdate);

      // Cleanup function to remove the event listener
      return () => {
        player.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [player]);

  const seekTo = (timeInSeconds: number) => {
    const frameToSeek = Math.round(timeInSeconds * FPS);
    player?.seekTo(frameToSeek);
  };

  const togglePlay = useCallback(() => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    if (newState) {
      player?.play();
    } else {
      player?.pause();
    }
  }, [isPlaying, player]);

  const [selectedAsset, setSelectedAsset] = useState<VisualAssetType | null>(
    null,
  );
  const [isSelectingAsset, setIsSelectingAsset] = useState(false);

  useEffect(() => {
    if (isSelectingAsset && playerRef.current) {
      player?.pause();
      setIsPlaying(false);
    }
  }, [isSelectingAsset, player]);

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
        setIsPlaying,
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
