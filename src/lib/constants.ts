import { capitalizeFirstLetter } from './utils';
import { VOICEMODELS } from './validators/voicemodel';

export const MAX_IMAGE_GENERATIONS = 3;
export const FPS = 30;
export const width = 1080;
export const height = 1920;

export const storyboardWidth = 512;
export const storyboardHeight = 512;

export const voicemodelAudios = Object.values(VOICEMODELS).map(
  (model: VOICEMODELS) => ({
    name: model,
    title: capitalizeFirstLetter(model),
    src: `https://cdn.openai.com/API/docs/audio/${model}.wav`,
  }),
);

export const musicAudios = [
  {
    name: 'deep',
    title: 'Deep',
    src: 'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/deep.mp3?t=2024-03-04T12%3A55%3A07.216Z',
    forceValue:
      'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/deep.mp3?t=2024-03-04T12%3A55%3A07.216Z',
  },
  {
    name: 'epic',
    title: 'Epic',
    src: 'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/epic.mp3?t=2024-03-04T12%3A55%3A17.212Z',
    forceValue:
      'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/epic.mp3?t=2024-03-04T12%3A55%3A17.212Z',
  },
  {
    name: 'interesting',
    title: 'Interesting',
    src: 'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/interesting.mp3?t=2024-03-04T12%3A55%3A46.994Z',
    forceValue:
      'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/interesting.mp3?t=2024-03-04T12%3A55%3A46.994Z',
  },
  {
    name: 'mysterious',
    title: 'Mysterious',
    src: 'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/epic.mp3?t=2024-03-04T12%3A55%3A17.212Z',
    forceValue:
      'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/epic.mp3?t=2024-03-04T12%3A55%3A17.212Z',
  },
  {
    name: 'powerful',
    title: 'Powerful',
    src: 'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/powerful.mp3?t=2024-03-04T12%3A55%3A57.036Z',
    forceValue:
      'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/powerful.mp3?t=2024-03-04T12%3A55%3A57.036Z',
  },
  {
    name: 'sentimental',
    title: 'Sentimental',
    src: 'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/sentimental.mp3?t=2024-03-04T12%3A56%3A06.111Z',
    forceValue:
      'https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/sentimental.mp3?t=2024-03-04T12%3A56%3A06.111Z',
  },
];
