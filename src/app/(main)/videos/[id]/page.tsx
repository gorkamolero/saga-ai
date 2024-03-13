'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Editor } from '@/components/editor';
import { api } from '@/trpc/react';
import { type FullVideoType } from '@/lib/validators/videos';

const VideoPage = () => {
  const { id } = useParams();
  const { data: video, isLoading } = api.videos.getFull.useQuery({
    id: id as string,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback="Loading...">
      <Editor video={video as FullVideoType} />
    </Suspense>
  );
};

export default VideoPage;
