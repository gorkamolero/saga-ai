import { type VideoType } from '@/server/api/routers/videos';
import { type VoiceoverType } from '@/server/api/routers/voiceovers';

export type FullVideoType = VideoType & {
  visualAssets: any[];
  voiceover: VoiceoverType;
  script: string;
};
