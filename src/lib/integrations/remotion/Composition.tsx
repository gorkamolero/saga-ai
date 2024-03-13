'user client';

import React from 'react';

import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import {
  Img,
  useCurrentFrame,
  AbsoluteFill,
  Audio,
  OffthreadVideo,
} from 'remotion';

import { TranscriptionCaptions } from './TranscriptionCaptions';
import {
  generateEffectFilter,
  getDurationInFrames,
} from '@/lib/utils/animations';
import type { VisualAssetType } from '@/lib/validators/visual-assets';
import { type PREMIUM_FX } from '@/lib/validators/fx';
import { type VoiceoverType } from '@/server/api/routers/voiceovers';

export interface CompositionProps {
  fps: number;
  subtitles: any;
  music: string;
  assets: VisualAssetType[];
  voiceover: string | VoiceoverType;
}

export interface sagaProps extends CompositionProps, Record<string, unknown> {}

export const saga: React.FC<sagaProps> = ({
  fps,
  subtitles,
  assets,
  music,
  voiceover,
}) => {
  let accumulatedFrames = 0;
  const currentFrame = useCurrentFrame();
  const voiceoverUrl =
    typeof voiceover === 'string' ? voiceover : voiceover.url;
  return (
    <>
      <TransitionSeries>
        {assets.map((asset, index) => {
          if (!asset?.url && !asset?.animation) return null;

          const isLastImage = index === assets.length - 1;

          const durationInFrames = getDurationInFrames(asset, fps, isLastImage);

          const from = accumulatedFrames;

          const { transform } = generateEffectFilter({
            effect: asset?.fx as PREMIUM_FX,
            currentFrame,
            from,
            durationInFrames,
          });

          accumulatedFrames += durationInFrames - fps;

          return (
            <React.Fragment key={asset.id}>
              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                {asset?.animation ? (
                  <OffthreadVideo src={asset?.animation} />
                ) : (
                  <Img
                    src={asset?.url || ''}
                    style={{
                      transform,
                    }}
                  />
                )}
              </TransitionSeries.Sequence>
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: 30 })}
              />
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      <AbsoluteFill>
        <Audio src={voiceoverUrl} />
        <Audio
          src={
            music ||
            'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/deep.mp3'
          }
          volume={0.2}
        />
      </AbsoluteFill>

      <TranscriptionCaptions subtitles={subtitles} fps={fps} />
    </>
  );
};
