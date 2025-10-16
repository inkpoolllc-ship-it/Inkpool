import { getAuthenticatedUser, getServerSupabase } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await getServerSupabase()
  const { data: existing } = await supabase.from('artists').select('id').eq('id', user.id).maybeSingle()
  if (existing?.id) {
    // Seed demo pool if none exist
    const { count } = await supabase.from('pools').select('id', { count: 'exact', head: true }).eq('artist_id', user.id)
    if ((count ?? 0) === 0) {
      await supabase.from('pools').insert({
        artist_id: user.id,
        name: 'Demo Pool',
        rules: { price_cents: 1000, spots: 10, prize_cents: 20000, credit_cents: 500, tokens_threshold: 10 },
      })
    }
    return NextResponse.json({ ok: true, created: false })
  }
  // capture referral code from cookie if present
  const cookieStore = await cookies()
  const referral = cookieStore.get('ref')?.value ?? null
  let referred_by: string | null = null
  if (referral) {
    const { data: refArtist } = await supabase.from('artists').select('id').eq('ref_code', referral).maybeSingle()
    referred_by = refArtist?.id ?? null
  }
  const ref_code = user.id.slice(0, 8)
  const initialTokens = 1 // keep 1 free token on signup regardless
  const { error } = await supabase.from('artists').insert({
    id: user.id,
    email: user.email,
    pool_tokens: initialTokens,
    ref_code,
    referred_by,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  // Seed initial demo pool
  await supabase.from('pools').insert({
    artist_id: user.id,
    name: 'Demo Pool',
    rules: { price_cents: 1000, spots: 10, prize_cents: 20000, credit_cents: 500, tokens_threshold: 10 },
  })
  return NextResponse.json({ ok: true, created: true })
}


