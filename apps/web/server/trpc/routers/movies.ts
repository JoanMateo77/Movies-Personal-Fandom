// apps/web/server/trpc/routers/movies.ts
import { z } from "zod";
import { router, publicProcedure, TRPCError } from "../trpc-utils";

export const moviesRouter = router({
  search: publicProcedure
    .input(
      z.object({
        q: z.string().optional(),
        genre: z.union([z.string(), z.array(z.string())]).optional(),
        rows: z.number().int().min(1).max(100).optional().default(25),
        startYearFrom: z.number().optional(),
        startYearTo: z.number().optional(),
        sortOrder: z.enum(["ASC", "DESC"]).optional().default("ASC"),
        sortField: z.string().optional().default("id"),
        cursorMark: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.rapid.searchMovies({
          q: input.q,
          genre: input.genre as any,
          rows: input.rows,
          startYearFrom: input.startYearFrom,
          startYearTo: input.startYearTo,
          sortOrder: input.sortOrder,
          sortField: input.sortField,
          cursorMark: input.cursorMark,
        });
      } catch (err: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: err?.message ?? "Search failed" });
      }
    }),

  getById: publicProcedure.input(z.string().min(1)).query(async ({ input, ctx }) => {
    try {
      return await ctx.rapid.getMovieById(input);
    } catch (err: any) {
      throw new TRPCError({ code: "NOT_FOUND", message: err?.message ?? "Movie not found" });
    }
  }),

  getRating: publicProcedure.input(z.string().min(1)).query(async ({ input, ctx }) => {
    try {
      return await ctx.rapid.getRating(input);
    } catch (err: any) {
      throw new TRPCError({ code: "BAD_REQUEST", message: err?.message ?? "Rating fetch failed" });
    }
  }),

  getGenres: publicProcedure.input(z.undefined()).query(async ({ ctx }) => {
    try {
      return await ctx.rapid.getGenres();
    } catch (err: any) {
      throw new TRPCError({ code: "BAD_REQUEST", message: err?.message ?? "Genres fetch failed" });
    }
  }),

  getTop250: publicProcedure.input(z.undefined()).query(async ({ ctx }) => {
    try {
      return await ctx.rapid.getTop250();
    } catch (err: any) {
      throw new TRPCError({ code: "BAD_REQUEST", message: err?.message ?? "Top250 fetch failed" });
    }
  }),
});
