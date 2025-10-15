import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(){}, set(){}, remove(){} } as any }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `artist_logos/${user.id}/logo.${ext}`;

  // @ts-ignore storage typing via anon key
  const { error: upErr } = await (supabase as any).storage.from('public').upload(path, bytes, {
    contentType: file.type || 'image/png',
    upsert: true,
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

  // @ts-ignore get public URL
  const { data: pub } = (supabase as any).storage.from('public').getPublicUrl(path);
  const url = pub?.publicUrl;
  if (url) {
    await supabase.from('artists').update({ logo_url: url }).eq('id', user.id);
  }
  return NextResponse.json({ url });
}


