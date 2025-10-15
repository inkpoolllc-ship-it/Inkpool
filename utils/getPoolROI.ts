import { getServiceSupabase } from '@/lib/supabaseServer'
import type { ROI } from '@/types'

export async function getPoolROI(poolId: string): Promise<ROI> {
  const supabase = getServiceSupabase()
  const [{ data: entries }, { data: pool }] = await Promise.all([
    supabase.from('entries').select('amount_cents').eq('pool_id', poolId),
    supabase.from('pools').select('rules').eq('id', poolId).single(),
  ])

  const gross = (entries ?? []).reduce((sum, e: any) => sum + (e.amount_cents || 0), 0)
  const prize = (pool?.rules?.prize_cents as number) || 0
  // Simplified liability: sum of negative credits deltas outstanding
  const { data: creditRows } = await supabase
    .from('credits_ledger')
    .select('delta_cents')
    .eq('pool_id', poolId)
  const creditLiability = (creditRows ?? []).reduce(
    (sum, r: any) => sum + (r.delta_cents || 0),
    0,
  )
  const roi = prize > 0 ? (gross - prize - creditLiability) / prize : 0
  return { gross, prize, creditLiability, roi }
}

export default getPoolROI


