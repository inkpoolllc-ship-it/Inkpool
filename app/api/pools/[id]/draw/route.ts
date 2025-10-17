import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Use the synchronous helper so supabase is a SupabaseClient, not a Promise
  const supabase = getServerSupabase();

  const poolId = params.id;
  const { data: pool, error: poolErr } = await supabase
    .from('pools')
    .select('id, rules')
    .eq('id', poolId)
    .single();

  if (poolErr) {
    return NextResponse.json({ error: poolErr.message }, { status: 500 });
  }

  // TODO: keep your draw logic here. This example returns the pool for now.
  return NextResponse.json({ pool }, { status: 200 });
}