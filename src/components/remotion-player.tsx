import { FullVideoType } from '@/app/(main)/videos/[id]/page';
import { FPS } from '@/lib/constants';
import {
  Tubesleuth,
  TubesleuthProps,
} from '@/lib/integrations/remotion/Composition';
import { convertSecondsToFrames } from '@/lib/utils/animations';
import { TranscriptType } from '@/lib/validators/transcript';
import { VisualAssetType } from '@/lib/validators/visual-assets';
import { DialogDrawer } from './ui/dialog-drawer';
import { redirect } from 'next/navigation';
import { Player } from '@remotion/player';

export const RemotionPlayer = ({ video }: { video: FullVideoType }) => {
  const transcript = video?.voiceover?.transcript as TranscriptType;
  const assets = video?.visualAssets.sort((a, b) => a.index - b.index);
  const videoDuration = video?.duration || 0;

  console.log('video', assets);

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

  const inputProps: TubesleuthProps = {
    videoId: video.id,
    fps: ourFPS,
    script: video.script as string,
    subtitles,
    assets: assets as VisualAssetType[],
    // TODO: MUSIC
    music:
      'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/deep.mp3?t=2024-03-04T12%3A55%3A07.216Z',
    voiceover: video.voiceover.url as string,
    durationInFrames,
  };

  return (
    <DialogDrawer
      open
      title="Your video"
      onClose={() => redirect(`/videos/${video.id}`)}
    >
      <div
        className="flex w-full flex-col items-center justify-center"
        style={{ aspectRatio: '9 / 16' }}
      >
        <Player
          component={Tubesleuth}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          compositionWidth={1080}
          compositionHeight={1920}
          fps={ourFPS}
          style={{
            width: '100%',
            aspectRatio: '9/16',
          }}
          controls
        />
      </div>
    </DialogDrawer>
  );
};
