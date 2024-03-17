import { type FullVideoType } from '@/lib/validators/videos';
import { FPS } from '@/lib/constants';
import { Saga, type sagaProps } from '@/lib/integrations/remotion/Composition';
import { convertSecondsToFrames } from '@/lib/utils/animations';
import { type TranscriptType } from '@/lib/validators/transcript';
import { type VisualAssetType } from '@/lib/validators/visual-assets';
import { Player } from '@remotion/player';
import { useContext } from 'react';
import { EditorContext } from './editor-context';

export const RemotionPlayer = ({ video }: { video: FullVideoType }) => {
  const { playerRef, togglePlay } = useContext(EditorContext);
  const transcript = video?.voiceover?.transcript as TranscriptType;
  const assets = video?.visualAssets.sort(
    (a: any, b: any) => a.index - b.index,
  );
  const videoDuration = video?.duration || 0;

  const ourFPS = FPS;

  const duration = Math.min(videoDuration + 2, 60);

  const durationInFrames = convertSecondsToFrames(duration, ourFPS);

  const subtitles = transcript.words.map(
    (w: { text: string; start: number; end: number }) => ({
      text: w.text,
      start: w.start,
      end: w.end,
    }),
  );

  const inputProps: sagaProps = {
    videoId: video.id,
    fps: ourFPS,
    script: video.script,
    subtitles,
    assets: assets as VisualAssetType[],
    // TODO: MUSIC
    music:
      'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/deep.mp3?t=2024-03-04T12%3A55%3A07.216Z',
    voiceover: video.voiceover.url!,
    durationInFrames,
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-black/80 p-4 transition-colors hover:bg-black">
      <div
        className="flex w-full flex-col items-center justify-center"
        style={{ aspectRatio: '9 / 16' }}
        onClick={togglePlay}
      >
        <Player
          clickToPlay={false}
          component={Saga}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          compositionWidth={1080}
          compositionHeight={1920}
          fps={ourFPS}
          style={{
            width: '100%',
            aspectRatio: '9/16',
          }}
          initiallyShowControls
          ref={playerRef}
        />
      </div>
    </div>
  );
};
