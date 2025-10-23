// apps/web/server/trpc/context.ts
import * as adapter from "../../lib/rapidAdapter";

export const createContext = async () => {
  return {
    rapid: adapter,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
