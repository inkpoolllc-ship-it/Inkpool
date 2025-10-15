import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const sort = url.searchParams.get("sort") || "newest"; // newest, filling, value
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = Math.min(parseInt(url.searchParams.get("pageSize") || "12", 10), 24);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(){}, set(){}, remove(){} } as any }
  );

  let query = supabase
    .from("v_open_pools")
    .select("pool_id,name,rules,status,created_at,artist_id,artist_name,logo_url,brand_color,entry_count");

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  if (sort === "filling") {
    query = query.order("entry_count", { ascending: false });
  } else if (sort === "value") {
    query = query.order("rules->>prize_cents", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await query.range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    pools: (data || []).map((r: any) => ({
      id: r.pool_id,
      name: r.name,
      artist: { id: r.artist_id, name: r.artist_name, logo: r.logo_url, color: r.brand_color },
      rules: r.rules,
      entries: r.entry_count,
      createdAt: r.created_at,
    })),
    page,
    pageSize,
    total: null,
  });
}


