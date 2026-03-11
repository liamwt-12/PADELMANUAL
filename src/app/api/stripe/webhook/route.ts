import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  })

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const email = session.metadata?.venue_owner_email || session.customer_email
      const venueOwnerId = session.metadata?.venue_owner_id
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as Stripe.Subscription)?.id

      const customerId = typeof session.customer === 'string'
        ? session.customer
        : (session.customer as Stripe.Customer)?.id

      // Update venue_owners → premium
      const filter = venueOwnerId
        ? supabase.from('venue_owners').update({
            subscription_status: 'premium',
            stripe_customer_id: customerId || null,
            stripe_subscription_id: subscriptionId || null,
          }).eq('id', venueOwnerId)
        : supabase.from('venue_owners').update({
            subscription_status: 'premium',
            stripe_customer_id: customerId || null,
            stripe_subscription_id: subscriptionId || null,
          }).eq('email', email!)

      const { error } = await filter
      if (error) console.error('checkout.session.completed update error:', error)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const subscriptionId = subscription.id
      const status = subscription.status // active, past_due, canceled, unpaid, etc.

      // Map Stripe status to our status
      let ourStatus: 'premium' | 'free' = 'premium'
      if (['canceled', 'unpaid', 'incomplete_expired'].includes(status)) {
        ourStatus = 'free'
      }

      const { error } = await supabase
        .from('venue_owners')
        .update({ subscription_status: ourStatus })
        .eq('stripe_subscription_id', subscriptionId)

      if (error) console.error('subscription.updated error:', error)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const subscriptionId = subscription.id

      const { error } = await supabase
        .from('venue_owners')
        .update({
          subscription_status: 'free',
          stripe_subscription_id: null,
        })
        .eq('stripe_subscription_id', subscriptionId)

      if (error) console.error('subscription.deleted error:', error)
      break
    }
  }

  return NextResponse.json({ received: true })
}
