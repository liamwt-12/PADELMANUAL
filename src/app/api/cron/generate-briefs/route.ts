import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 120

/**
 * Weekly intelligence brief generation.
 * Runs every Monday at 7am UTC via Vercel Cron.
 *
 * For each premium venue owner, gathers stats, calls Claude API
 * to generate a brief, saves it, and sends an email notification.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const resendKey = process.env.RESEND_API_KEY
  if (!anthropicKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Get all premium venue owners
  const { data: owners } = await supabase
    .from('venue_owners')
    .select('id, email, name, listing_id, gbp_access_token, gbp_refresh_token, gbp_location_id, gbp_connected_at')
    .eq('subscription_status', 'premium')
    .not('listing_id', 'is', null)

  if (!owners || owners.length === 0) {
    return NextResponse.json({ generated: 0 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.padelmanual.com'
  const weekStart = getMonday(new Date()).toISOString().split('T')[0]
  let generated = 0

  for (const owner of owners) {
    try {
      // Skip if brief already exists for this week
      const { data: existing } = await supabase
        .from('intelligence_briefs')
        .select('id')
        .eq('listing_id', owner.listing_id)
        .eq('week_start', weekStart)
        .limit(1)

      if (existing && existing.length > 0) continue

      const data = await gatherData(supabase, owner, siteUrl)
      const brief = await generateBrief(anthropicKey, data)

      // Save brief
      await supabase.from('intelligence_briefs').insert({
        listing_id: owner.listing_id,
        week_start: weekStart,
        brief_text: brief.text,
        action_item: brief.action,
        metrics: data.metrics,
      })

      // Create notification
      await supabase.from('venue_notifications').insert({
        listing_id: owner.listing_id,
        type: 'brief_ready',
        title: 'Your weekly brief is ready',
        body: 'See what happened last week and your action for this week.',
        action_url: '/venue/dashboard/intelligence',
      })

      // Update last generated timestamp
      await supabase
        .from('venue_owners')
        .update({ brief_last_generated_at: new Date().toISOString() })
        .eq('id', owner.id)

      // Send email
      if (resendKey) {
        const firstName = owner.name?.split(' ')[0] || 'there'
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Padel Manual <hello@padelmanual.com>',
            to: [owner.email],
            subject: `Your weekly brief for ${data.venueName}`,
            text: [
              `${firstName}, your Padel Manual weekly brief is ready.`,
              '',
              `${siteUrl}/venue/dashboard/intelligence`,
              '',
              '---',
              'Padel Manual',
              'padelmanual.com',
            ].join('\n'),
          }),
        })
      }

      generated++
    } catch (err) {
      console.error(`Brief generation failed for ${owner.email}:`, err)
    }
  }

  return NextResponse.json({ generated })
}

/* ── Helpers ── */

function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.getFullYear(), d.getMonth(), diff)
}

type BriefData = {
  venueName: string
  city: string
  metrics: Record<string, unknown>
  prompt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function gatherData(
  supabase: any,
  owner: Record<string, unknown>,
  _siteUrl: string,
): Promise<BriefData> {
  const listingId = owner.listing_id as string

  // Fetch listing
  const { data: listing } = await supabase
    .from('listings')
    .select('name, city, slug, view_count, click_count, booking_url, google_rating, google_review_count')
    .eq('id', listingId)
    .single()

  const venueName = listing?.name || 'Your Venue'
  const city = listing?.city || 'UK'

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Leads this week vs last week
  const { count: leadsThisWeek } = await supabase
    .from('listing_leads')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .gte('created_at', weekAgo.toISOString())

  const { count: leadsLastWeek } = await supabase
    .from('listing_leads')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .gte('created_at', twoWeeksAgo.toISOString())
    .lt('created_at', weekAgo.toISOString())

  // Unanswered leads
  const { count: unansweredLeads } = await supabase
    .from('listing_leads')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .eq('contacted', false)

  // Play Today clicks this week vs last week
  const { count: playTodayThisWeek } = await supabase
    .from('play_today_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .gte('clicked_at', weekAgo.toISOString())

  const { count: playTodayLastWeek } = await supabase
    .from('play_today_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .gte('clicked_at', twoWeeksAgo.toISOString())
    .lt('clicked_at', weekAgo.toISOString())

  // Reviews — new this week (from venue_reviews)
  const { count: newReviews } = await supabase
    .from('venue_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .eq('approved', true)
    .gte('created_at', weekAgo.toISOString())

  const { count: unansweredReviews } = await supabase
    .from('venue_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .eq('approved', true)
    .is('owner_response', null)

  // Daily stats this week vs last (from listing_stats_daily)
  const { data: statsThisWeek } = await supabase
    .from('listing_stats_daily')
    .select('views, booking_clicks')
    .eq('listing_id', listingId)
    .gte('date', weekAgo.toISOString().split('T')[0])

  const { data: statsLastWeek } = await supabase
    .from('listing_stats_daily')
    .select('views, booking_clicks')
    .eq('listing_id', listingId)
    .gte('date', twoWeeksAgo.toISOString().split('T')[0])
    .lt('date', weekAgo.toISOString().split('T')[0])

  const viewsThisWeek = statsThisWeek?.reduce((s: number, r: Record<string, number>) => s + (r.views || 0), 0) || 0
  const viewsLastWeek = statsLastWeek?.reduce((s: number, r: Record<string, number>) => s + (r.views || 0), 0) || 0
  const clicksThisWeek = statsThisWeek?.reduce((s: number, r: Record<string, number>) => s + (r.booking_clicks || 0), 0) || 0
  const clicksLastWeek = statsLastWeek?.reduce((s: number, r: Record<string, number>) => s + (r.booking_clicks || 0), 0) || 0

  // Use cumulative counts as fallback if no daily stats yet
  const finalViewsThisWeek = viewsThisWeek || (listing?.view_count ?? 0)
  const finalViewsLastWeek = viewsLastWeek || 0
  const finalClicksThisWeek = clicksThisWeek || (listing?.click_count ?? 0)
  const finalClicksLastWeek = clicksLastWeek || 0

  // Competitors — nearest 3 with view counts
  const { data: selfListing } = await supabase
    .from('listings')
    .select('lat, lng')
    .eq('id', listingId)
    .single()

  let competitorText = 'None nearby'
  if (selfListing?.lat && selfListing?.lng) {
    const latDelta = 5 / 69
    const lngDelta = latDelta / Math.cos(selfListing.lat * Math.PI / 180)

    const { data: nearbyVenues } = await supabase
      .from('listings')
      .select('name, view_count, lat, lng')
      .neq('id', listingId)
      .gte('lat', selfListing.lat - latDelta)
      .lte('lat', selfListing.lat + latDelta)
      .gte('lng', selfListing.lng - lngDelta)
      .lte('lng', selfListing.lng + lngDelta)
      .or('permanently_closed.is.null,permanently_closed.eq.false')
      .eq('listing_type', 'venue')
      .order('view_count', { ascending: false, nullsFirst: false })
      .limit(3)

    if (nearbyVenues && nearbyVenues.length > 0) {
      competitorText = nearbyVenues.map((v: Record<string, any>) => {
        const dist = haversineDistance(selfListing.lat!, selfListing.lng!, v.lat!, v.lng!)
        return `${v.name} (${dist.toFixed(1)}mi, ${v.view_count || 0} views)`
      }).join(', ')
    }
  }

  // Booking URL check
  let bookingUrlStatus = 'N/A'
  if (listing?.booking_url) {
    try {
      const res = await fetch(listing.booking_url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      })
      bookingUrlStatus = res.ok ? `OK (${res.status})` : `Error (${res.status})`
    } catch {
      bookingUrlStatus = 'Unreachable'
    }
  }

  const metrics = {
    views_this_week: finalViewsThisWeek,
    views_last_week: finalViewsLastWeek,
    clicks_this_week: finalClicksThisWeek,
    clicks_last_week: finalClicksLastWeek,
    leads_this_week: leadsThisWeek || 0,
    leads_last_week: leadsLastWeek || 0,
    unanswered_leads: unansweredLeads || 0,
    new_reviews: newReviews || 0,
    unanswered_reviews: unansweredReviews || 0,
    play_today_clicks_this_week: playTodayThisWeek || 0,
    play_today_clicks_last_week: playTodayLastWeek || 0,
    booking_url_status: bookingUrlStatus,
    google_rating: listing?.google_rating,
    google_review_count: listing?.google_review_count,
  }

  const prompt = `You are writing a weekly intelligence brief for a padel venue owner.
Tone: Padel Manual brand voice — confident, specific, like a well-written analyst note.
No emojis. No "Hi [Name]!". No fluff. Get to the numbers immediately.

Write 3-4 short paragraphs covering:
- Listing performance this week (views, clicks, leads) vs last week — be specific about the delta
- Google reputation if available — rating, review count
- One observation about the competitive landscape if relevant

End with ONE specific action item for this week. Just one. Make it concrete and actionable.
Format the action item on its own final line, starting with a verb.

Keep the entire brief under 250 words. Be direct. Use numbers. Don't soften bad news.

Data:
Venue: ${venueName}, ${city}
This week views: ${finalViewsThisWeek} (last week: ${finalViewsLastWeek})
This week booking clicks: ${finalClicksThisWeek} (last week: ${finalClicksLastWeek})
New leads this week: ${leadsThisWeek || 0} (last week: ${leadsLastWeek || 0})
Total unanswered leads: ${unansweredLeads || 0}
Google rating: ${listing?.google_rating ?? 'N/A'} (${listing?.google_review_count ?? 0} reviews)
New reviews this week: ${newReviews || 0}
Unanswered reviews: ${unansweredReviews || 0}
Play Today clicks this week: ${playTodayThisWeek || 0} (last week: ${playTodayLastWeek || 0})
Nearest venues: ${competitorText}
Booking URL status: ${bookingUrlStatus}`

  return { venueName, city, metrics, prompt }
}

async function generateBrief(apiKey: string, data: BriefData): Promise<{ text: string; action: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: data.prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error: ${err}`)
  }

  const result = await res.json()
  const fullText = result.content?.[0]?.text || ''

  // Extract the last line as the action item
  const lines = fullText.trim().split('\n').filter((l: string) => l.trim())
  const action = lines[lines.length - 1] || 'Review your listing and ensure all information is current.'
  const text = lines.slice(0, -1).join('\n\n').trim() || fullText

  return { text, action }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
