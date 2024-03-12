'use client';

import { getInputProps } from 'remotion';
import { type VisualAssetType } from '../validators/visual-assets';
import mockData from '@/lib/integrations/remotion/lib/mockData';

import type { PREMIUM_FX } from '@/lib/validators/fx';

// Define the AnimationType with only the required properties for the effects
export type AnimationType = {
  phaseX: number; // Range [0..7]
  phaseY: number; // Range [0..7]
  phaseZ: number; // Range [0..7]
  amplitudeX: number; // Range [0..10]
  amplitudeY: number; // Range [0..10]
  amplitudeZ: number; // Range [0..10]
  pattern?: string;
  animationLength?: number; // Range [1..6]
  gain?: number; // Range [0..10]
  convergence?: number; // Range [-1..1]
};

const amplitudeAmount = 1;
const phaseAmount = 2.5;

export interface Animation {
  title: string;
  description: string;
  key: string;
}

export const animations: Record<PREMIUM_FX, Animation> = {
  horizontal: {
    title: 'Horizontal',
    description: 'Horizontal motion',
    key: 'horizontal',
  },
  vertical: {
    title: 'Vertical',
    description: 'Vertical motion',
    key: 'vertical',
  },
  circle: {
    title: 'Circle',
    description: 'Circular motion',
    key: 'circle',
  },
  perspective: {
    title: 'Perspective',
    description: 'Perspective motion',
    key: 'perspective',
  },
  zoom: {
    title: 'Zoom',
    description: 'Zoom motion',
    key: 'zoom',
  },
};

export type AnimationFX =
  | 'horizontal'
  | 'vertical'
  | 'circle'
  | 'perspective'
  | 'zoom'
  | {
      phaseX: number;
      phaseY: number;
      phaseZ: number;
      amplitudeX: number;
      amplitudeY: number;
      amplitudeZ: number;
      gain?: number;
    };

export const animationParameters = {
  horizontal: {
    phaseX: phaseAmount,
    phaseY: 0,
    phaseZ: 0,
    amplitudeX: amplitudeAmount,
    amplitudeY: 0.0,
    amplitudeZ: 0.0,
  },
  vertical: {
    phaseX: 0,
    phaseY: 2,
    phaseZ: 0,
    amplitudeX: 0.0,
    amplitudeY: 0.5,
    amplitudeZ: 0,
    gain: 0.3,
  },
  circle: {
    phaseX: 0,
    phaseY: 0.25,
    phaseZ: 0.25,
    amplitudeX: 0.25,
    amplitudeY: 0.25,
    amplitudeZ: 0,
    gain: 0.6,
  },
  perspective: {
    phaseX: 0,
    phaseY: 0.25,
    phaseZ: 0.25,
    amplitudeX: 0.1,
    amplitudeY: 0.05,
    amplitudeZ: 0.4,
    gain: 0.6,
  },
  zoom: {
    phaseX: 0,
    phaseY: 0,
    phaseZ: 4,
    amplitudeX: 0.0,
    amplitudeY: 0.0,
    amplitudeZ: 1.5,
  },
};

export const convertSecondsToFrames = (seconds: number, fps: number) =>
  seconds * fps;

export function generateEffectFilter({
  effect,
  currentFrame,
  from,
  durationInFrames,
}: {
  effect: string;
  currentFrame: number;
  from: number;
  durationInFrames: number;
}) {
  let transform = '';

  const progress = Math.max(
    0,
    Math.min(1, (currentFrame - from) / durationInFrames),
  ); // Ensures progress is between 0 and 1

  switch (effect) {
    case 'perspective':
    case 'horizontal':
    case 'vertical':
    case 'circle':
    case 'zoom':
    case 'ZoomIn':
      transform = `scale(${Math.min(1.1, 1 + progress * 0.1)})`; // Caps the maximum scale at 1.1
      break;
    case 'ZoomOut':
      transform = `scale(${Math.max(1, 1.1 - progress * 0.1)})`; // Ensures scale does not go below 1
      break;
    case 'PanLeft':
    case 'PanRight':
      const translateX = Math.min(10, progress * 10); // Caps the maximum translateX at 10%
      transform = `translateX(${
        effect === 'PanLeft' ? -translateX : translateX
      }%) scale(1.2)`;
      break;
    case 'PanUp':
    case 'PanDown':
      const translateY = Math.min(10, progress * 10); // Caps the maximum translateY at 10%
      transform = `translateY(${
        effect === 'PanUp' ? -translateY : translateY
      }%) scale(1.2)`;
      break;
    default:
      transform = 'scale(1)';
  }

  return {
    transform,
  };
}

export const getDurationInFrames = (
  visualAsset: VisualAssetType,
  fps: number,
  isLast: boolean,
) => {
  if (
    visualAsset.start == undefined ||
    visualAsset.start === null ||
    !visualAsset.end
  ) {
    throw new Error('Visual asset must have start and end');
  }
  const startInMS = visualAsset.start;
  const endInMS = visualAsset.end;

  const start = convertMsToFrames(startInMS, fps);
  const end = isLast
    ? convertMsToFrames(endInMS, fps) + fps
    : convertMsToFrames(endInMS, fps) + 1;

  return Math.round(end - start) + fps;
};

export function convertMsToFrames(ms: number, fps: number) {
  return Math.round((ms / 1000) * fps);
}

export const getFullInputProps = () => {
  const inputProps: any = getInputProps();
  if (inputProps && Object.keys(inputProps).length) {
    return inputProps;
  }
  return mockData;
};
