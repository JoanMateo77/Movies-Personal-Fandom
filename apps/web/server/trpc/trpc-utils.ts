// apps/web/server/trpc/trpc-utils.ts
import { initTRPC, TRPCError as TRPCErrorClass } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// export helpers tipados
export const router = t.router;
export const publicProcedure = t.procedure;

// exporta TRPCError correctamente (alias para claridad)
export const TRPCError = TRPCErrorClass;
