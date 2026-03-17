import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY!

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
    || request.headers.get('authorization')?.replace('Bearer ', '')
    || request.cookies.get('admin_secret')?.value
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { listing_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.listing_id) {
    return NextResponse.json({ error: 'listing_id required' }, { status: 400 })
  }

  if (!PLACES_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY not configured' }, { status: 500 })
  }

  // 1. Fetch the listing from Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  const { data: listing, error: dbError } = await supabase
    .from('listings')
    .select('id, name, city, google_place_id, website_url, phone, email')
    .eq('id', body.listing_id)
    .single()

  if (dbError) {
    return NextResponse.json({ error: 'DB error', details: dbError }, { status: 500 })
  }
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  // 2. Search Places API if no google_place_id
  let placeId = listing.google_place_id as string | null
  let searchResult = null

  if (!placeId) {
    const query = `${listing.name} padel ${listing.city || ''}`.trim()
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName',
      },
      body: JSON.stringify({ textQuery: query, languageCode: 'en', maxResultCount: 1 }),
    })
    searchResult = await searchRes.json()
    placeId = searchResult?.places?.[0]?.id || null
  }

  if (!placeId) {
    return NextResponse.json({
      listing,
      place_search: searchResult,
      place_id: null,
      details: null,
    })
  }

  // 3. Get Place details
  const detailRes = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`,
    {
      headers: {
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': 'id,displayName,websiteUri,nationalPhoneNumber,internationalPhoneNumber,formattedAddress',
      },
    },
  )

  const detailBody = await detailRes.text()
  let details = null
  try {
    details = JSON.parse(detailBody)
  } catch {
    return NextResponse.json({
      listing,
      place_id: placeId,
      detail_status: detailRes.status,
      detail_raw: detailBody.slice(0, 500),
      details: null,
    })
  }

  return NextResponse.json({
    listing,
    place_id: placeId,
    details,
  })
}
