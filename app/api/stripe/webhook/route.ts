import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServiceSupabase } from '@/lib/supabaseServer'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature') as string
  const body = await request.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET as string)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const artistId = session.metadata?.artist_id
    const product = session.metadata?.product
    const quantity = Number(session.metadata?.quantity || 1)
    if (artistId && product === 'token') {
      await supabase.rpc('increment_artist_tokens', { artist_id: artistId, qty: quantity }).single().catch(async () => {
        const { data: artist } = await supabase.from('artists').select('pool_tokens').eq('id', artistId).single()
        await supabase.from('artists').update({ pool_tokens: (artist?.pool_tokens ?? 0) + quantity }).eq('id', artistId)
      })
      await supabase.from('payments').insert({
        artist_id: artistId,
        stripe_session_id: session.id,
        product: 'token',
        quantity,
        amount_cents: Number(session.amount_total || 0),
      })

      // Referral bonus: if this is the first purchase for referred artist, give referrer +1 token
      const { data: referred } = await supabase.from('artists').select('referred_by, referral_bonus_awarded').eq('id', artistId).single()
      if (referred?.referred_by && !referred?.referral_bonus_awarded) {
        await supabase.rpc('increment_artist_tokens', { artist_id: referred.referred_by, qty: 1 }).single().catch(async () => {
          const { data: refArtist } = await supabase.from('artists').select('pool_tokens').eq('id', referred.referred_by).single()
          await supabase.from('artists').update({ pool_tokens: (refArtist?.pool_tokens ?? 0) + 1 }).eq('id', referred.referred_by)
        })
        await supabase.from('artists').update({ referral_bonus_awarded: true }).eq('id', artistId)
      }
    }
  }

  return NextResponse.json({ received: true })
}

export const config = { api: { bodyParser: false } }


