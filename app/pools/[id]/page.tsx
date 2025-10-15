import { getAuthenticatedUser, getServerSupabase } from '@/lib/supabaseServer'
import getPoolROI from '@/utils/getPoolROI'

export default async function PoolDetails({ params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return (
      <div className="p-6">
        <a className="underline" href="/login">Sign in</a>
      </div>
    )
  }
  const supabase = getServerSupabase()
  const { data: pool } = await supabase
    .from('pools')
    .select('id,name,status,rules,created_at')
    .eq('id', params.id)
    .single()
  const roi = await getPoolROI(params.id)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{pool?.name}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="border rounded p-3">Gross ${(roi.gross / 100).toFixed(2)}</div>
        <div className="border rounded p-3">Prize ${(roi.prize / 100).toFixed(2)}</div>
        <div className="border rounded p-3">Credit Liability ${(roi.creditLiability / 100).toFixed(2)}</div>
        <div className="border rounded p-3">ROI {roi.roi.toFixed(2)}</div>
      </div>

      <div className="space-y-3">
        <h2 className="font-medium">Add Entry</h2>
        <form action="/api/entries" method="post" className="flex gap-2">
          <input type="hidden" name="pool_id" value={pool?.id} />
          <input name="amount_cents" type="number" min="100" step="100" placeholder="Amount cents" className="border rounded px-2 py-1" />
          <button className="px-3 py-1 rounded border">Add Entry</button>
        </form>
      </div>
    </div>
  )
}


