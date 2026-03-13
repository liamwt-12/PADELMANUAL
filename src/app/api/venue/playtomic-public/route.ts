import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
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

  const { data: { user } } = await authClient.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: owner } = await supabase
    .from('venue_owners')
    .select('listing_id')
    .eq('email', user.email)
    .single()

  if (!owner?.listing_id) {
    return NextResponse.json({ error: 'No listing' }, { status: 404 })
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('id, playtomic_tenant_id, playtomic_rating, playtomic_review_count, playtomic_data_updated_at')
    .eq('id', owner.listing_id)
    .single()

  if (!listing?.playtomic_tenant_id) {
    return NextResponse.json({ rating: null, reviewCount: null, noTenant: true })
  }

  // Return cached data if fresh (< 24 hours)
  if (listing.playtomic_rating != null && listing.playtomic_data_updated_at) {
    const age = Date.now() - new Date(listing.playtomic_data_updated_at).getTime()
    if (age < 24 * 60 * 60 * 1000) {
      return NextResponse.json({
        rating: listing.playtomic_rating,
        reviewCount: listing.playtomic_review_count,
        tenantId: listing.playtomic_tenant_id,
      })
    }
  }

  // Fetch from Playtomic public API
  try {
    const res = await fetch(`https://playtomic.io/api/v1/tenants/${listing.playtomic_tenant_id}`, {
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json({ rating: null, reviewCount: null, tenantId: listing.playtomic_tenant_id })
    }

    const data = await res.json()
    const rating = data.properties?.rating ?? data.rating ?? null
    const reviewCount = data.properties?.number_of_ratings ?? data.number_of_ratings ?? null

    // Cache in DB
    await supabase
      .from('listings')
      .update({
        playtomic_rating: rating,
        playtomic_review_count: reviewCount,
        playtomic_data_updated_at: new Date().toISOString(),
      })
      .eq('id', listing.id)

    return NextResponse.json({ rating, reviewCount, tenantId: listing.playtomic_tenant_id })
  } catch {
    return NextResponse.json({ rating: null, reviewCount: null, tenantId: listing.playtomic_tenant_id })
  }
}
