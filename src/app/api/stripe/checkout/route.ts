import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padelmanual.com'

  // Get authenticated user
  const user = await getAuthUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Look up venue owner
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: owner } = await supabase
    .from('venue_owners')
    .select('id, email, name, listing_id, stripe_customer_id')
    .eq('email', user.email)
    .single()

  if (!owner) {
    return NextResponse.json({ error: 'No venue owner found' }, { status: 404 })
  }

  // Reuse or create Stripe customer
  let customerId = owner.stripe_customer_id

  if (!customerId) {
    // Check if customer already exists in Stripe by email
    const existing = await stripe.customers.list({ email: user.email, limit: 1 })
    if (existing.data.length > 0) {
      customerId = existing.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: owner.name || undefined,
        metadata: {
          venue_owner_id: owner.id,
          listing_id: owner.listing_id || '',
        },
      })
      customerId = customer.id
    }

    // Save Stripe customer ID
    await supabase
      .from('venue_owners')
      .update({ stripe_customer_id: customerId })
      .eq('id', owner.id)
  }

  // Create checkout session — £29/mo recurring
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          recurring: { interval: 'month' },
          product_data: {
            name: 'Padel Manual Premium',
            description: 'Analytics, leads, Google insights, and listing management.',
          },
          unit_amount: 2900, // £29.00
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/venue/dashboard?upgraded=true`,
    cancel_url: `${siteUrl}/venue/dashboard/settings`,
    metadata: {
      venue_owner_id: owner.id,
      venue_owner_email: user.email,
      listing_id: owner.listing_id || '',
    },
  })

  return NextResponse.redirect(session.url!, 303)
}
