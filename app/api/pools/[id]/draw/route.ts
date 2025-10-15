import { getAuthenticatedUser, getServerSupabase } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getServerSupabase()
  const poolId = params.id
  const { data: pool, error: poolErr } = await supabase
    .from('pools')
    .select('id, rules')
    .eq('id', poolId)
    .single()
  if (poolErr || !pool) return NextResponse.json({ error: 'Pool not found' }, { status: 404 })

  const { data: entries } = await supabase.from('entries').select('customer_id').eq('pool_id', poolId)
  const participants = (entries ?? []).map((e: any) => e.customer_id).filter(Boolean)

  let winnerCustomerId: string | null = null
  let method: 'random' | 'guaranteed' = 'random'
  const threshold = pool.rules?.tokens_threshold ?? 0
  if (threshold > 0 && participants.length >= threshold) {
    method = 'guaranteed'
    winnerCustomerId = participants[Math.floor(Math.random() * participants.length)] || null
  } else if (participants.length > 0) {
    winnerCustomerId = participants[Math.floor(Math.random() * participants.length)] || null
  }

  if (!winnerCustomerId) {
    return NextResponse.json({ error: 'No participants' }, { status: 400 })
  }

  const prize = pool.rules?.prize_cents ?? 0
  const { data: winner } = await supabase
    .from('winners')
    .insert({ pool_id: poolId, customer_id: winnerCustomerId, method, prize_cents: prize })
    .select()
    .single()

  // Reset winner tokens, add +1 token to non-winners, and credit non-winners
  const distinct = Array.from(new Set(participants)) as string[]
  const nonWinners = distinct.filter((id) => id !== winnerCustomerId)
  const tokenRows = [
    { pool_id: poolId, customer_id: winnerCustomerId, delta: 0, reason: 'win_reset' as const },
    ...nonWinners.map((cid) => ({ pool_id: poolId, customer_id: cid, delta: 1, reason: 'played' as const })),
  ]
  if (tokenRows.length > 0) {
    await supabase.from('tokens_ledger').insert(tokenRows as any)
  }
  const creditAmount = pool.rules?.credit_cents ?? 0
  if (creditAmount > 0 && nonWinners.length > 0) {
    await supabase.from('credits_ledger').insert(
      nonWinners.map((cid) => ({ pool_id: poolId, customer_id: cid, delta_cents: creditAmount, reason: 'non_winner_credit' })) as any,
    )
  }

  await supabase.from('requests').insert({
    artist_id: user.id,
    customer_id: winnerCustomerId,
    pool_id: poolId,
    kind: 'winner',
    status: 'pending',
  })

  return NextResponse.json({ ok: true, winner })
}


