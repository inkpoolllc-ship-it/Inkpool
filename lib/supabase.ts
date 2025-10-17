import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Returns a Supabase client synchronously for server routes.
 * IMPORTANT: This must remain synchronous (do NOT make this function async or return a Promise).
 */
export function getServerSupabase() {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        // If you need to set/delete cookies for auth flows, implement set/delete here.
      },
    }
  );
}