// apps/web/app/api/test/search/route.ts
import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/rapidAdapter";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "Vera";
  const rows = Number(url.searchParams.get("rows") ?? "5");
  try {
    const resp = await searchMovies({ q, rows });
    return NextResponse.json({ ok: true, resp });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message ?? String(err) }, { status: 500 });
  }
}
