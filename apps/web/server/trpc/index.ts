// apps/web/server/trpc/index.ts
import { router } from "./trpc-utils";
import { moviesRouter } from "./routers/movies";

export const appRouter = router.merge("movies.", moviesRouter);

export type AppRouter = typeof appRouter;
