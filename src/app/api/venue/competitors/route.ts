import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const RADIUS_MILES = 5
const DEG_PER_MILE = 1 / 69 // rough approximation

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3959 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

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
    .select('id, lat, lng')
    .eq('id', owner.listing_id)
    .single()

  if (!listing?.lat || !listing?.lng) {
    return NextResponse.json({ count: 0, nearby: [], insight: null })
  }

  // Bounding box filter — rough ±0.1° for ~5 miles
  const latDelta = RADIUS_MILES * DEG_PER_MILE
  const lngDelta = latDelta / Math.cos(listing.lat * Math.PI / 180)

  const { data: candidates } = await supabase
    .from('listings')
    .select('id, name, slug, lat, lng')
    .neq('id', listing.id)
    .gte('lat', listing.lat - latDelta)
    .lte('lat', listing.lat + latDelta)
    .gte('lng', listing.lng - lngDelta)
    .lte('lng', listing.lng + lngDelta)
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .eq('listing_type', 'venue')

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({
      count: 0,
      nearby: [],
      insight: "You're the only padel venue we know of in your area. You have the local market to yourself.",
    })
  }

  // Calculate exact distances and filter to 5 miles (exclude anything at 0mi — likely self/duplicate)
  const withDistance = candidates
    .map(v => ({
      name: v.name,
      slug: v.slug,
      distance: haversineDistance(listing.lat!, listing.lng!, v.lat!, v.lng!),
    }))
    .filter(v => v.distance > 0.01 && v.distance <= RADIUS_MILES)
    .sort((a, b) => a.distance - b.distance)

  const count = withDistance.length

  if (count === 0) {
    return NextResponse.json({
      count: 0,
      nearby: [],
      insight: "You're the only padel venue we know of in your area. You have the local market to yourself.",
    })
  }

  const nearby = withDistance.slice(0, 3).map(v => ({
    name: v.name,
    slug: v.slug,
    distance: Math.round(v.distance * 10) / 10,
  }))

  let insight: string | null = null
  if (count <= 2) {
    insight = `You're one of only ${count + 1} padel venues in this area. That's a strong position.`
  }

  return NextResponse.json({ count, nearby, insight })
}
