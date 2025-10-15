import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(_req: NextRequest) {
  const url = new URL(_req.url);
  const artistId = url.searchParams.get("artist");
  const poolId = url.searchParams.get("pool");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(){}, set(){}, remove(){} } as any }
  );

  if (!artistId) return NextResponse.json({ error: "missing artist" }, { status: 400 });

  const { data: artist } = await supabase
    .from("artists")
    .select("id,name,logo_url,brand_color")
    .eq("id", artistId)
    .single();

  if (!artist) return NextResponse.json({ error: "artist not found" }, { status: 404 });

  if (poolId) {
    const { data: pool } = await supabase
      .from("pools")
      .select("id,name,rules,status")
      .eq("id", poolId)
      .eq("artist_id", artistId)
      .single();
    if (!pool || (pool as any).status !== "open") {
      return NextResponse.json({ artist, pool: null, openPools: [] });
    }
    return NextResponse.json({ artist, pool, openPools: [] });
  }

  const { data: openPools } = await supabase
    .from("pools")
    .select("id,name,rules,status,created_at")
    .eq("artist_id", artistId)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return NextResponse.json({ artist, pool: null, openPools: openPools || [] });
}


