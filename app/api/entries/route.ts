// app/api/entries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type SupabaseClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Narrow what we accept from the client
type Body = {
  artistId: string;
  poolId: string;
  email?: string;       // optional, we’ll fall back to auth user
  entries?: number;     // optional, default 1
};

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies(); // Next 15: await it

    // ✅ createServerClient is SYNC — do NOT await
    const supabase: SupabaseClient = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // set/remove not used here on server – omit to avoid type noise
      },
    });

    // parse body safely
    const body = (await req.json()) as unknown;
    const { artistId, poolId, email: bodyEmail, entries: rawEntries } = (body ?? {}) as Body;

    if (!artistId || !poolId) {
      return NextResponse.json({ error: "artistId and poolId are required" }, { status: 400 });
    }

    // pull auth user (fallback if email isn’t provided)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const email = bodyEmail ?? user?.email ?? "client@example.com";
    const entries = Math.max(1, Number(rawEntries ?? 1));

    // upsert/find customer
    const { data: existingCustomer, error: customerSelErr } = await supabase
      .from("customers")
      .select("id")
      .eq("artist_id", artistId)
      .eq("email", email)
      .maybeSingle();

    if (customerSelErr) {
      return NextResponse.json({ error: customerSelErr.message }, { status: 500 });
    }

    let customerId = existingCustomer?.id as string | undefined;

    if (!customerId) {
      const { data: inserted, error: insErr } = await supabase
        .from("customers")
        .insert({ artist_id: artistId, email })
        .select("id")
        .single();

      if (insErr) {
        return NextResponse.json({ error: insErr.message }, { status: 500 });
      }
      customerId = inserted.id;
    }

    // insert entry
    const { data: entry, error: entryErr } = await supabase
      .from("entries")
      .insert({
        artist_id: artistId,
        pool_id: poolId,
        customer_id: customerId,
        count: entries,
      })
      .select("*")
      .single();

    if (entryErr) {
      return NextResponse.json({ error: entryErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, entry });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
