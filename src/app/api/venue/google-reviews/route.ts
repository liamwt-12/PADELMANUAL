import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

  const listingId = request.nextUrl.searchParams.get('listing_id')
  let ownerQuery = supabase
    .from('venue_owners')
    .select('listing_id')
    .eq('email', user.email)
  if (listingId) ownerQuery = ownerQuery.eq('listing_id', listingId)
  const { data: owners } = await ownerQuery.limit(1)
  const owner = owners?.[0] || null

  if (!owner?.listing_id) {
    return NextResponse.json({ error: 'No listing' }, { status: 404 })
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('id, name, postcode, google_place_id, google_rating, google_review_count, google_data_updated_at')
    .eq('id', owner.listing_id)
    .single()

  if (!listing) {
    return NextResponse.json({ error: 'No listing' }, { status: 404 })
  }

  // Return cached data if fresh (< 24 hours)
  if (listing.google_rating != null && listing.google_data_updated_at) {
    const age = Date.now() - new Date(listing.google_data_updated_at).getTime()
    if (age < 24 * 60 * 60 * 1000) {
      return NextResponse.json({
        rating: listing.google_rating,
        reviewCount: listing.google_review_count,
        placeId: listing.google_place_id,
      })
    }
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Places API not configured' }, { status: 500 })
  }

  let placeId = listing.google_place_id

  // Find place ID via Text Search if we don't have one
  if (!placeId) {
    const query = `${listing.name} padel ${listing.postcode || ''}`.trim()
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()

    if (searchData.results?.length > 0) {
      placeId = searchData.results[0].place_id
      await supabase
        .from('listings')
        .update({ google_place_id: placeId })
        .eq('id', listing.id)
    } else {
      return NextResponse.json({ rating: null, reviewCount: null, placeId: null, notFound: true })
    }
  }

  // Fetch place details
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,url&key=${apiKey}`
  const detailsRes = await fetch(detailsUrl)
  const detailsData = await detailsRes.json()

  if (detailsData.result) {
    const rating = detailsData.result.rating ?? null
    const reviewCount = detailsData.result.user_ratings_total ?? null
    const mapsUrl = detailsData.result.url ?? null

    // Cache in DB
    await supabase
      .from('listings')
      .update({
        google_rating: rating,
        google_review_count: reviewCount,
        google_data_updated_at: new Date().toISOString(),
      })
      .eq('id', listing.id)

    return NextResponse.json({ rating, reviewCount, placeId, mapsUrl })
  }

  return NextResponse.json({ rating: null, reviewCount: null, placeId })
}
