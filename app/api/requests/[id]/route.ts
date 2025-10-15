import { getAuthenticatedUser, getServerSupabase } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getServerSupabase()
  const form = await request.formData()
  const status = form.get('status') as 'approved' | 'declined' | 'scheduled'
  const when_text = (form.get('when_text') as string) || null

  const { error } = await supabase
    .from('requests')
    .update({ status, when_text })
    .eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}


