import { NextResponse } from 'next/server'
import { getAuthenticatedUser, getServerSupabase } from '@/lib/supabaseServer'

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getServerSupabase()
  const form = await request.formData()
  const pool_id = form.get('pool_id') as string
  const amount_cents = Number(form.get('amount_cents') || 0)

  if (!pool_id || amount_cents <= 0) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Ensure a customer exists for this user under this artist (artist is current user)
  const artistId = user.id
  const email = user.email || 'client@example.com'
  let { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('artist_id', artistId)
    .eq('email', email)
    .maybeSingle()
  if (!customer) {
    const { data: created } = await supabase
      .from('customers')
      .insert({ artist_id: artistId, email, name: user.user_metadata?.full_name || null })
      .select('id')
      .single()
    customer = created as any
  }

  const { error } = await supabase.from('entries').insert({
    pool_id,
    customer_id: customer?.id,
    amount_cents,
    source: 'admin',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}


