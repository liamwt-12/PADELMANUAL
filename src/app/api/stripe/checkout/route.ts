import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padelmanual.com'

  // Read plan selection from form data
  const formData = await request.formData()
  const plan = (formData.get('plan') as string) || 'monthly'

  const priceId =
    plan === 'annual'
      ? process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID
      : process.env.STRIPE_PREMIUM_PRICE_ID

  if (!priceId) {
    return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
  }

  // Get auth user + Supabase admin client in parallel
  const cookieStore = await cookies()
  const authClient = createServerClient(
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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: { user } } = await authClient.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: owner } = await supabase
    .from('venue_owners')
    .select('id, email, name, listing_id, stripe_customer_id')
    .eq('email', user.email)
    .single()

  if (!owner) {
    return NextResponse.json({ error: 'No venue owner found' }, { status: 404 })
  }

  // Reuse existing Stripe customer or create one
  let customerId = owner.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: owner.name || undefined,
      metadata: { venue_owner_id: owner.id, listing_id: owner.listing_id || '' },
    })
    customerId = customer.id

    // Fire-and-forget — don't wait for this
    supabase
      .from('venue_owners')
      .update({ stripe_customer_id: customerId })
      .eq('id', owner.id)
      .then(() => {})
  }

  const submitMessage =
    plan === 'annual'
      ? 'Padel Manual Business — annual plan, £249/year. Cancel anytime.'
      : 'Padel Manual Business — monthly plan, £29/month. Cancel anytime.'

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    custom_text: {
      submit: { message: submitMessage },
    },
    success_url: `${siteUrl}/venue/dashboard?upgraded=true`,
    cancel_url: `${siteUrl}/venue/dashboard/settings`,
    metadata: {
      venue_owner_id: owner.id,
      venue_owner_email: user.email,
      listing_id: owner.listing_id || '',
      plan,
    },
  })

  return NextResponse.redirect(session.url!, 303)
}
