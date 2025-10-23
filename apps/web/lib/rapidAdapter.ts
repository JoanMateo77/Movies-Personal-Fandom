// apps/web/lib/rapidAdapter.ts
/* Adaptador para imdb236.p.rapidapi.com — mapea `results` tal como en tu ejemplo */

const HOST = process.env.RAPIDAPI_HOST ?? "imdb236.p.rapidapi.com";
const KEY = process.env.RAPIDAPI_KEY as string | undefined;

// Validación en runtime
if (!KEY) throw new Error("RAPIDAPI_KEY must be set in .env.local");

function buildUrl(path: string, params?: Record<string, any>) {
  const url = new URL(`https://${HOST}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach((val) => url.searchParams.append(`${k}[]`, String(val)));
      } else {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return url.toString();
}

async function callRapid(path: string, params?: Record<string, any>) {
  const url = buildUrl(path, params);

  // Aquí arreglamos el typing: garantizamos strings en headers
  const headers: Record<string, string> = {
    "x-rapidapi-host": HOST,
    "x-rapidapi-key": KEY!, // ya validado arriba
    Accept: "application/json",
  };

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Invalid JSON from RapidAPI (${res.status}): ${text}`);
  }

  if (!res.ok) {
    const msg = json?.message ?? JSON.stringify(json);
    const err: any = new Error(`RapidAPI ${res.status}: ${msg}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }

  return json;
}

/* Tipos */
export type MovieSummary = {
  id: string;
  title: string;
  year?: number | null;
  poster?: string | null;
  genres?: string[] | null;
  averageRating?: number | null;
  numVotes?: number | null;
  runtimeMinutes?: number | null;
  primaryImage?: string | null;
  description?: string | null;
};

export type MovieDetail = MovieSummary & {
  countriesOfOrigin?: string[] | null;
  productionCompanies?: any[] | null;
};

/* Funciones adaptador */

export async function searchMovies(opts: {
  q?: string;
  genre?: string | string[];
  rows?: number;
  startYearFrom?: number;
  startYearTo?: number;
  sortOrder?: "ASC" | "DESC";
  sortField?: string;
  cursorMark?: string;
}) {
  const params: Record<string, any> = {
    type: "movie",
    rows: opts.rows ?? 25,
    sortOrder: opts.sortOrder ?? "ASC",
  };
  if (opts.genre) params.genre = opts.genre;
  if (opts.q) params.primaryTitleAutocomplete = opts.q;
  if (opts.startYearFrom) params.startYearFrom = opts.startYearFrom;
  if (opts.startYearTo) params.startYearTo = opts.startYearTo;
  if (opts.sortField) params.sortField = opts.sortField;
  if (opts.cursorMark) params.cursorMark = opts.cursorMark;

  const data = await callRapid("/api/imdb/search", params);
  const results = data?.results ?? [];
  const items: MovieSummary[] = Array.isArray(results)
    ? results.map((it: any) => ({
        id: it.id ?? it.tconst ?? String(it.id ?? ""),
        title: it.primaryTitle ?? it.title ?? "",
        year: it.startYear ?? it.releaseDate ?? null,
        poster: it.primaryImage ?? it.image ?? null,
        primaryImage: it.primaryImage ?? null,
        description: it.description ?? null,
        genres: it.genres ?? null,
        averageRating: it.averageRating ?? null,
        numVotes: it.numVotes ?? null,
        runtimeMinutes: it.runtimeMinutes ?? null,
      }))
    : [];

  return {
    items,
    total: data?.numFound ?? data?.total ?? items.length,
    raw: data,
    cursor: data?.cursorMark ?? null,
  };
}

export async function getMovieById(id: string) {
  if (!id) throw new Error("id required");
  const data = await callRapid(`/api/imdb/${encodeURIComponent(id)}`);
  const d = data ?? {};
  const detail: MovieDetail = {
    id: d.id ?? d.tconst ?? id,
    title: d.primaryTitle ?? d.title ?? d.name ?? "",
    year: d.startYear ?? d.releaseDate ?? null,
    poster: d.primaryImage ?? d.image ?? null,
    primaryImage: d.primaryImage ?? null,
    description: d.description ?? d.plot ?? null,
    genres: d.genres ?? null,
    averageRating: d.averageRating ?? null,
    numVotes: d.numVotes ?? null,
    runtimeMinutes: d.runtimeMinutes ?? null,
    countriesOfOrigin: d.countriesOfOrigin ?? d.country ?? null,
    productionCompanies: d.productionCompanies ?? null,
  };
  return { detail, raw: d };
}

export async function getRating(id: string) {
  if (!id) throw new Error("id required");
  const data = await callRapid(`/api/imdb/${encodeURIComponent(id)}/rating`);
  return { rating: data?.averageRating ?? data?.rating ?? null, raw: data };
}

export async function getGenres() {
  const data = await callRapid("/api/imdb/genres");
  return data?.genres ?? data ?? [];
}

export async function getTop250() {
  const data = await callRapid("/api/imdb/top250-movies");
  const list = data?.items ?? data?.results ?? data ?? [];
  return Array.isArray(list) ? list : [];
}

export default {
  searchMovies,
  getMovieById,
  getRating,
  getGenres,
  getTop250,
};
