import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: '', ...options, maxAge: 0 })
      },
    },
  })

  // Refresh session and gate protected routes
  const { data } = await supabase.auth.getUser()
  const isAuthed = Boolean(data.user)
  const path = req.nextUrl.pathname
  const isProtected = path.startsWith('/dashboard') || path.startsWith('/client')

  if (isProtected && !isAuthed) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pools/:path*',
    // do not include /auth/callback or /login here
  ],
}


