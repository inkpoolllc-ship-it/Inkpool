import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getAuthenticatedUser } from '@/lib/supabaseServer'

export async function POST() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Pool Token' },
          unit_amount: 4900,
        },
        quantity: 1,
      },
    ],
    metadata: { artist_id: user.id, product: 'token' },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=1`,
  })

  return NextResponse.redirect(session.url!, { status: 303 })
}


