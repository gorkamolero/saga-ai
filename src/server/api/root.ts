import { createTRPCRouter } from '@/server/api/trpc';
import { userRouter } from './routers/users';
import { ideaRouter } from './routers/ideas';
import { writerRouter } from './routers/writers';
import { scriptRouter } from './routers/scripts';
import { voiceoverRouter } from './routers/voiceovers';
import { videoRouter } from './routers/videos';
import { conversationRouter } from './routers/conversations';
import { visualAssetRouter } from './routers/assets';
import { artistRouter } from './routers/artists';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: userRouter,
  conversations: conversationRouter,
  ideas: ideaRouter,
  writers: writerRouter,
  artists: artistRouter,
  scripts: scriptRouter,
  voiceovers: voiceoverRouter,
  videos: videoRouter,
  assets: visualAssetRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
