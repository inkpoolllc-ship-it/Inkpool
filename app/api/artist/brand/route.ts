import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: () => undefined as any, set: () => {}, remove: () => {} } as any }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await supabase.from("artists").update({
    brand_color: body.brand_color,
    logo_url: body.logo_url,
    facebook_url: body.facebook_url,
    instagram_url: body.instagram_url,
    website_url: body.website_url,
  }).eq("id", user.id);
  return NextResponse.json({ ok: true });
}


