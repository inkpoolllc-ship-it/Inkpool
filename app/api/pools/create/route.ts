import { getAuthenticatedUser, getServerSupabase } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getServerSupabase()
  const form = await request.formData()
  const name = (form.get('name') as string) || 'New Pool'

  const { data: artist } = await supabase.from('artists').select('pool_tokens').eq('id', user.id).single()
  if (!artist) return NextResponse.json({ error: 'Artist not found' }, { status: 404 })

  if ((artist.pool_tokens ?? 0) < 1) {
    const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout`
    return NextResponse.json({ requiresPurchase: true, checkoutUrl })
  }

  const { error: decErr } = await supabase.rpc('decrement_artist_tokens', { artist_id: user.id }).single().catch(() => ({ error: null }))
  // If no RPC exists yet, do a direct update
  if (decErr) {
    const { error: updErr } = await supabase.from('artists').update({ pool_tokens: (artist.pool_tokens ?? 0) - 1 }).eq('id', user.id)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 })
  }

  const { data: pool, error } = await supabase
    .from('pools')
    .insert({ artist_id: user.id, name, rules: { price_cents: 0, spots: 0, prize_cents: 0, credit_cents: 0 } })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, pool })
}


