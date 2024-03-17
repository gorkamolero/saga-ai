'use client';

import { Composition, Video, getInputProps } from 'remotion';

import { Saga } from './Composition';
import {
  COMPOSITION_DURATION_IN_FRAMES,
  COMPOSITION_FPS,
  COMPOSITION_HEIGHT,
  COMPOSITION_ID,
  COMPOSITION_WIDTH,
} from './lib/constants';
import mockData from './mockData';

export const RemotionRoot = () => {
  const inputProps =
    getInputProps() && Object.keys(getInputProps()).length
      ? getInputProps()
      : mockData;

  return (
    <>
      <Composition
        id={COMPOSITION_ID}
        component={Saga}
        durationInFrames={inputProps.durationInFrames as number}
        fps={COMPOSITION_FPS}
        width={COMPOSITION_WIDTH}
        height={COMPOSITION_HEIGHT}
        defaultProps={mockData}
      />
    </>
  );
};
