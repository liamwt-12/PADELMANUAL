import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * GET /api/play-today
 *
 * Finds venues with live Playtomic availability near a location.
 *
 * Query params:
 *   lat, lng       — coordinates (required, or use city)
 *   city           — city name (alternative to lat/lng)
 *   window         — 'now' | 'morning' | 'afternoon' | 'evening' (default: 'now')
 *   radius         — search radius in miles (default: 10, max: 25)
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const city = params.get('city')
  let lat = parseFloat(params.get('lat') || '')
  let lng = parseFloat(params.get('lng') || '')
  const window = params.get('window') || 'now'
  const radius = Math.min(parseFloat(params.get('radius') || '10') || 10, 25)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )

  // Resolve city to coordinates if no lat/lng
  if ((isNaN(lat) || isNaN(lng)) && city) {
    const { data: cityVenues } = await supabase
      .from('listings')
      .select('lat, lng')
      .eq('city', city)
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .limit(1)

    if (cityVenues && cityVenues.length > 0) {
      lat = cityVenues[0].lat!
      lng = cityVenues[0].lng!
    }
  }

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Location required (lat/lng or city)' }, { status: 400 })
  }

  // Calculate time window
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  let startTime: string
  let endTime: string

  switch (window) {
    case 'morning':
      startTime = `${today}T06:00:00`
      endTime = `${today}T12:00:00`
      break
    case 'afternoon':
      startTime = `${today}T12:00:00`
      endTime = `${today}T18:00:00`
      break
    case 'evening':
      startTime = `${today}T18:00:00`
      endTime = `${today}T23:00:00`
      break
    case 'now':
    default: {
      const h = now.getUTCHours()
      const m = now.getUTCMinutes()
      startTime = `${today}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      const eh = twoHoursLater.getUTCHours()
      const em = twoHoursLater.getUTCMinutes()
      endTime = `${today}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00`
      break
    }
  }

  // Find venues with Playtomic within radius
  const { data: venues } = await supabase
    .from('listings')
    .select('id, name, slug, lat, lng, courts, indoor, playtomic_tenant_id, playtomic_url, price_per_hour_peak, price_per_hour_offpeak')
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('playtomic_tenant_id', 'is', null)
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  if (!venues || venues.length === 0) {
    return NextResponse.json({
      venues: [],
      search: { lat, lng, city: city || '', window, radius_miles: radius, venues_checked: 0, venues_with_availability: 0, generated_at: now.toISOString() },
    }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } })
  }

  // Filter by distance (Haversine)
  const R = 3959
  const nearbyVenues = venues
    .map(v => {
      const dLat = (v.lat! - lat) * Math.PI / 180
      const dLng = (v.lng! - lng) * Math.PI / 180
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat * Math.PI / 180) * Math.cos(v.lat! * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return { ...v, distance_miles: Math.round(dist * 10) / 10 }
    })
    .filter(v => v.distance_miles <= radius)
    .sort((a, b) => a.distance_miles - b.distance_miles)

  // Fetch availability from Playtomic in parallel (max 10 concurrent)
  const BATCH_SIZE = 10

  interface PlaytomicSlot {
    start_time: string
    duration: number
    price: string
  }

  interface PlaytomicResource {
    resource_id: string
    slots: PlaytomicSlot[]
  }

  type VenueResult = {
    id: string
    name: string
    slug: string
    distance_miles: number
    lat: number
    lng: number
    court_count: number | null
    indoor: boolean | null
    playtomic_tenant_id: string
    playtomic_url: string | null
    slots: {
      start_time: string
      duration: number
      price: string
      courts_available: number
      booking_url: string
    }[]
    has_availability: boolean
  }

  const results: VenueResult[] = []

  for (let i = 0; i < nearbyVenues.length; i += BATCH_SIZE) {
    const batch = nearbyVenues.slice(i, i + BATCH_SIZE)
    const fetches = batch.map(async (venue) => {
      const tenantId = venue.playtomic_tenant_id
      const url = `https://api.playtomic.io/v1/availability?sport_id=PADEL&tenant_id=${tenantId}&start_min=${startTime}&start_max=${endTime}`

      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)
        const res = await fetch(url, {
          headers: { 'User-Agent': 'PadelManual/1.0' },
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (!res.ok) {
          return { venue, slots: [] as VenueResult['slots'] }
        }

        const data = await res.json()

        // Aggregate slots by time
        const byTime: Record<string, { duration: number; price: string; count: number }> = {}
        if (Array.isArray(data)) {
          for (const resource of data as PlaytomicResource[]) {
            for (const slot of resource.slots) {
              if (!byTime[slot.start_time]) {
                byTime[slot.start_time] = { duration: slot.duration, price: slot.price, count: 0 }
              }
              byTime[slot.start_time].count++
            }
          }
        }

        const date = today
        const slots = Object.entries(byTime)
          .map(([time, info]) => ({
            start_time: time,
            duration: info.duration,
            price: info.price,
            courts_available: info.count,
            booking_url: venue.playtomic_url || `https://playtomic.io/tenant/${tenantId}?date=${date}&time=${time}`,
          }))
          .sort((a, b) => a.start_time.localeCompare(b.start_time))

        return { venue, slots }
      } catch {
        return { venue, slots: [] as VenueResult['slots'] }
      }
    })

    const batchResults = await Promise.allSettled(fetches)

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        const { venue, slots } = result.value
        results.push({
          id: venue.id,
          name: venue.name,
          slug: venue.slug,
          distance_miles: venue.distance_miles,
          lat: venue.lat!,
          lng: venue.lng!,
          court_count: venue.courts,
          indoor: venue.indoor,
          playtomic_tenant_id: venue.playtomic_tenant_id!,
          playtomic_url: venue.playtomic_url,
          slots,
          has_availability: slots.length > 0,
        })
      }
    }
  }

  // Sort: venues with availability first, then by distance
  results.sort((a, b) => {
    if (a.has_availability && !b.has_availability) return -1
    if (!a.has_availability && b.has_availability) return 1
    return a.distance_miles - b.distance_miles
  })

  const venuesWithAvail = results.filter(v => v.has_availability).length

  return NextResponse.json(
    {
      venues: results,
      search: {
        lat,
        lng,
        city: city || '',
        window,
        radius_miles: radius,
        venues_checked: nearbyVenues.length,
        venues_with_availability: venuesWithAvail,
        generated_at: now.toISOString(),
      },
    },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
  )
}
