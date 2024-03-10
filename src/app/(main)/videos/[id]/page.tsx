'use client';

import { useParams } from 'next/navigation';
import { VisualAssetInterface } from '@/components/visual-assets';
import { api } from '@/trpc/react';
import type { VideoType } from '@/server/api/routers/videos';
import { Suspense } from 'react';
import { VoiceoverType } from '@/server/api/routers/voiceovers';

export type FullVideoType = VideoType & {
  visualAssets: any[];
  voiceover: VoiceoverType;
  script: string;
};

const VideoPage = () => {
  const { id } = useParams();
  const { data: video, isLoading } = api.videos.getFull.useQuery({
    id: id as string,
  });

  return (
    <Suspense fallback="Loading...">
      <VisualAssetInterface video={video as FullVideoType} />
    </Suspense>
  );
};

export default VideoPage;
