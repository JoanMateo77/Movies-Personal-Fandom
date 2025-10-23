// apps/web/app/api/trpc/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/index";
import { createContext } from "@/server/trpc/context";

export async function POST(req: Request) {
  return fetchRequestHandler({
    req,
    router: appRouter,
    createContext: async () => await createContext(),
  });
}

export async function GET(req: Request) {
  // opcional: responde al playground o consultas simples
  return fetchRequestHandler({
    req,
    router: appRouter,
    createContext: async () => await createContext(),
  });
}
