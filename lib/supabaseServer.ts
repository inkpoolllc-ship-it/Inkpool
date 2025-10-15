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

export function getServerSupabase() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase public environment variables')
  }
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set(name, value, options)
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set(name, '', { ...options, maxAge: 0 })
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
  const supabase = getServerSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}


