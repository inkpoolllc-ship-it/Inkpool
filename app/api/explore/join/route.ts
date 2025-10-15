import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const body = await req.json();
  const { poolId, refCode } = body as { poolId: string; refCode?: string };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(){}, set(){}, remove(){} } as any }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: pool, error: pErr } = await supabase
    .from("pools")
    .select("id, artist_id, rules, status")
    .eq("id", poolId)
    .single();
  if (pErr || !pool || pool.status !== "open") {
    return NextResponse.json({ error: "pool not open" }, { status: 400 });
  }

  const email = user.email || "";
  const { data: customer } = await supabase
    .from("customers")
    .upsert({ artist_id: pool.artist_id, email, name: email }, { onConflict: "artist_id,email" })
    .select("id")
    .single();

  // optional referral capture (pending)
  if (refCode) {
    const { data: codeRow } = await supabase
      .from("referral_codes")
      .select("referrer_customer_id")
      .eq("artist_id", (pool as any).artist_id)
      .eq("code", refCode)
      .maybeSingle();
    if (codeRow && codeRow.referrer_customer_id !== customer?.id) {
      await supabase
        .from("referrals")
        .insert({
          artist_id: (pool as any).artist_id,
          referrer_customer_id: codeRow.referrer_customer_id,
          referred_customer_id: customer!.id,
          status: "pending",
        })
        .select("id")
        .single()
        .catch(() => null);
    }
  }

  const priceCents = Number((pool as any).rules?.price_cents || (pool as any).rules?.price || 0);
  if (!priceCents) return NextResponse.json({ error: "price missing" }, { status: 400 });

  const { error: eErr } = await supabase.from("entries").insert({
    pool_id: pool.id,
    customer_id: customer?.id,
    amount_cents: priceCents,
    source: "explore",
  });
  if (eErr) return NextResponse.json({ error: eErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}


