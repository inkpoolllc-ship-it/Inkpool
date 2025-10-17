import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function client() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(){}, set(){}, remove(){} } as any }
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const customerId = url.searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ messages: [] });
  const supabase = client();
  const { data } = await supabase
    .from("messages")
    .select("id,sender,body,created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true });
  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = client();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { customerId, text } = body;
  const { error } = await supabase.from("messages").insert({
    artist_id: user.id,
    customer_id: customerId,
    sender: "artist",
    body: text,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}


