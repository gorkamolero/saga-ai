import { createTRPCRouter } from '@/server/api/trpc';
import { userRouter } from './routers/users';
import { ideaRouter } from './routers/ideas';
import { writerRouter } from './routers/writers';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: userRouter,
  ideas: ideaRouter,
  writers: writerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
