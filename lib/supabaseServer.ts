import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export function getServiceSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

/**
 * Synchronous server Supabase client factory.
 *
 * Important: this function is synchronous and returns a SupabaseClient, NOT a Promise.
 * Callers should NOT await this function.
 *
 * Note about cookie setters:
 * - Reading cookies on the server is supported via cookies().get(...)
 * - Writing cookies usually requires access to a Response (NextResponse). If a route needs
 *   to set auth cookies on the response, create the server client inline in that route
 *   and pass a cookies object that writes to the response (see app/auth/callback/route.ts).
 */
export function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase public environment variables')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // Read cookies synchronously from next/headers
        return cookies().get(name)?.value ?? null
      },
      // Setting/removing cookies is a no-op here because many server contexts
      // need a Response object to mutate cookies. If you need to write cookies,
      // construct a server client inline in the route and use the response cookies.
      set(_name: string, _value: string, _options?: CookieOptions) {
        /* no-op in generic server helper */
      },
      remove(_name: string, _options?: CookieOptions) {
        /* no-op in generic server helper */
      },
    },
  })
}

export async function getUserFromAuthHeader(authorizationHeader?: string) {
  const token = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length)
    : undefined
  if (!token) return null
  const admin = getServiceSupabase()
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}

export async function getAuthenticatedUser() {
  // getServerSupabase is synchronous now
  const supabase = getServerSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}