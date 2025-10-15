import { getAuthenticatedUser, getServerSupabase } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getServerSupabase()
  const form = await request.formData()
  const kind = form.get('kind') as 'credit' | 'winner'
  const amount_cents = form.get('amount_cents') ? Number(form.get('amount_cents')) : null
  const note = (form.get('note') as string) || null
  const pool_id = (form.get('pool_id') as string) || null

  const artistId = user.id
  // Ensure a customer exists for this user under this artist
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

  const { error } = await supabase.from('requests').insert({
    artist_id: artistId,
    customer_id: customer?.id ?? null,
    pool_id,
    kind,
    note,
    amount_cents,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}


