// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const redirectTo = url.searchParams.get("redirect") || "/dashboard";

  // Prepare the redirect response FIRST so we can set cookies on it
  const res = NextResponse.redirect(
    new URL(redirectTo, process.env.NEXT_PUBLIC_APP_URL)
  );

  // Create a Supabase server client that WRITES auth cookies to this response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          const raw = req.headers.get('cookie') || ''
          const parts = raw.split(';').map(p => p.trim().split('='))
          const map: Record<string, string> = Object.fromEntries(parts as any)
          return map[name]
        },
        set: (name: string, value: string, options: any) => res.cookies.set(name, value, options),
        remove: (name: string, options: any) => res.cookies.set(name, "", { ...options, maxAge: 0 }),
      },
    } as any
  );

  // Exchange the magic link code for a signed session cookie
  if (code) {
    await supabase.auth.exchangeCodeForSession(code as string);
  }

  return res;
}
