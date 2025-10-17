// app/api/pools/[id]/draw/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  // Next 15: cookies() is async; createServerClient is sync
  const cookieStore = await cookies();
  const supabase: SupabaseClient = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value ?? null;
      },
    },
  });

  // ✅ Query pools table
  const { data: pool, error: poolErr } = await supabase
    .from("pools")
    .select("id, rules")
    .eq("id", id)
    .single();

  if (poolErr) {
    return NextResponse.json({ error: poolErr.message }, { status: 400 });
  }

  // Example of response (you can customize)
  return NextResponse.json({ ok: true, pool });
}
