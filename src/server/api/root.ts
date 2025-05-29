import { postRouter } from "~/server/api/routers/post";
import { categoryRouter } from "~/server/api/routers/category";
import { likeRouter } from "~/server/api/routers/like";
import { bookmarkRouter } from "~/server/api/routers/bookmark";
import { profileRouter } from "~/server/api/routers/profile";
import { userRouter } from "~/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	post: postRouter,
	category: categoryRouter,
	like: likeRouter,
	bookmark: bookmarkRouter,
	profile: profileRouter,
	user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
