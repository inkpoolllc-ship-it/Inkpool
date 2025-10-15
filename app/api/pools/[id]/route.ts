import { NextResponse } from 'next/server'
import { getAuthenticatedUser, getServerSupabase } from '@/lib/supabaseServer'
import getPoolROI from '@/utils/getPoolROI'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getServerSupabase()
  const { data: pool, error } = await supabase
    .from('pools')
    .select('id,name,status,rules,created_at')
    .eq('id', params.id)
    .single()
  if (error || !pool) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const roi = await getPoolROI(params.id)
  return NextResponse.json({ ...pool, ...roi })
}
