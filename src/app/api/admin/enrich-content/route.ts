import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 300

function checkAuth(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret')
    || request.headers.get('authorization')?.replace('Bearer ', '')
    || request.cookies.get('admin_secret')?.value
  return secret === process.env.ADMIN_SECRET
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

const CONTENT_PROMPT = `You are writing venue descriptions for Padel Manual, the UK's leading padel directory.
The tone is Monocle magazine — confident, specific, informed. Never vague or superlative.

Write a 150-200 word description for this padel venue. Use only the facts provided.
Do not invent details. If information is missing, omit that detail rather than guess.

Include where relevant:
- Number and type of courts (indoor/outdoor, surface)
- Location context (nearest transport, area of city)
- Booking system if known (Playtomic, direct booking)
- Coaching/lessons if available
- Parking situation if known
- One practical tip for first-time visitors
- Rating/reviews context if available

Never use: amazing, stunning, world-class, fantastic, great, perfect, state-of-the-art
Always be specific. "Four courts" not "multiple courts". "Ten minutes from the tube" not "well-connected".`

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const url = request.nextUrl
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20') || 20, 1), 50)
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0') || 0, 0)
  const singleId = url.searchParams.get('single_id')
  const dryRun = url.searchParams.get('dry_run') === 'true'
  const overwrite = url.searchParams.get('overwrite') === 'true'

  const supabase = getSupabaseAdmin()
  const anthropic = new Anthropic({ apiKey: anthropicKey })

  // Fetch venues that need descriptions
  let query = supabase
    .from('listings')
    .select('id, name, slug, city, region, courts, indoor, postcode, address, booking_platform, playtomic_tenant_id, playtomic_url, playtomic_rating, playtomic_review_count, google_place_id, google_rating, google_review_count, website_url, phone, lat, lng, description, price_per_hour_peak, price_per_hour_offpeak')
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')

  if (singleId) {
    query = query.eq('id', singleId)
  } else if (!overwrite) {
    // Only venues without descriptions or very short ones
    query = query.or('description.is.null,description.lt.50', { referencedTable: undefined } as never)
  }

  const { data: venues, error: fetchError } = await query
    .order('view_count', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  // Filter in JS for short descriptions (Supabase doesn't support length filters easily)
  const eligible = singleId || overwrite
    ? (venues || [])
    : (venues || []).filter(v => !v.description || v.description.length < 50)

  if (dryRun) {
    return NextResponse.json({
      eligible: eligible.length,
      venues: eligible.map(v => ({
        id: v.id,
        name: v.name,
        city: v.city,
        has_description: !!v.description,
        description_length: v.description?.length || 0,
      })),
    })
  }

  if (eligible.length === 0) {
    return NextResponse.json({ message: 'No venues need descriptions', processed: 0 })
  }

  // Get competitor counts per city
  const cities = [...new Set(eligible.map(v => v.city).filter(Boolean))]
  const competitorCounts: Record<string, number> = {}
  for (const city of cities) {
    const { count } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('city', city)
      .eq('listing_type', 'venue')
      .or('permanently_closed.is.null,permanently_closed.eq.false')
    competitorCounts[city!] = (count || 0) - 1 // exclude the venue itself
  }

  let generated = 0
  let skipped = 0
  let errors = 0
  const results: { name: string; preview: string; error?: string }[] = []

  for (const venue of eligible) {
    // Fetch Google Places details if available
    let googleHours: string | null = null
    let googleParking: string | null = null
    let googleWheelchair: string | null = null

    if (venue.google_place_id && process.env.GOOGLE_PLACES_API_KEY) {
      try {
        const fields = 'opening_hours,wheelchair_accessible_entrance'
        const placesUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${venue.google_place_id}&fields=${fields}&key=${process.env.GOOGLE_PLACES_API_KEY}`
        const placesRes = await fetch(placesUrl)
        const placesData = await placesRes.json()
        const result = placesData.result
        if (result) {
          if (result.opening_hours?.weekday_text) {
            googleHours = result.opening_hours.weekday_text.join(', ')
          }
          if (result.wheelchair_accessible_entrance !== undefined) {
            googleWheelchair = result.wheelchair_accessible_entrance ? 'Yes' : 'No'
          }
        }
      } catch {
        // Continue without Google data
      }
    }

    const competitorCount = venue.city ? (competitorCounts[venue.city] || 0) : 0

    const venueData = `Name: ${venue.name}
City: ${venue.city || 'Unknown'}
Courts: ${venue.courts || 'Unknown'}
Type: ${venue.indoor === true ? 'Indoor' : venue.indoor === false ? 'Outdoor' : 'Unknown'}
Postcode area: ${venue.postcode || 'Unknown'}
Google rating: ${venue.google_rating || 'N/A'}${venue.google_review_count ? ` (${venue.google_review_count} reviews)` : ''}
Playtomic rating: ${venue.playtomic_rating || 'N/A'}${venue.playtomic_review_count ? ` (${venue.playtomic_review_count} bookings)` : ''}
Has Playtomic booking: ${venue.playtomic_tenant_id ? 'Yes' : 'No'}
Opening hours: ${googleHours || 'Unknown'}
Parking available: ${googleParking || 'Unknown'}
Wheelchair accessible: ${googleWheelchair || 'Unknown'}
Website: ${venue.website_url || 'None'}
Peak price: ${venue.price_per_hour_peak ? `£${venue.price_per_hour_peak}/hr` : 'Unknown'}
Off-peak price: ${venue.price_per_hour_offpeak ? `£${venue.price_per_hour_offpeak}/hr` : 'Unknown'}
Competitor venues within 5 miles: ${competitorCount}`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `${CONTENT_PROMPT}\n\nVenue data:\n${venueData}\n\nWrite the description now. No preamble, no "Here is the description:", just the text itself.`,
        }],
      })

      const description = response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : ''

      if (!description) {
        skipped++
        results.push({ name: venue.name, preview: '', error: 'Empty response' })
        continue
      }

      // Save to listings
      await supabase
        .from('listings')
        .update({ description })
        .eq('id', venue.id)

      // Log enrichment
      await supabase
        .from('content_enrichment_log')
        .insert({
          listing_id: venue.id,
          description_generated: description,
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          model: 'claude-sonnet-4-20250514',
        })

      generated++
      results.push({ name: venue.name, preview: description.slice(0, 100) + '...' })
    } catch (err) {
      errors++
      results.push({ name: venue.name, preview: '', error: String(err).slice(0, 200) })
    }

    // Rate limit: 500ms between venues
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return NextResponse.json({
    processed: eligible.length,
    generated,
    skipped,
    errors,
    results,
  })
}
