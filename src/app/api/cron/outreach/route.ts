import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { outreachEmail } from '@/../emails/outreach-templates'

export const runtime = 'nodejs'

/**
 * Automated weekly outreach to unclaimed venues that have leads.
 * Runs every Monday at 9am UTC via Vercel Cron.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // ── Helper: scrape contact email from a website ──
  async function scrapeContactEmail(websiteUrl: string): Promise<string | null> {
    const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const PRIORITY_PREFIXES = ['contact', 'info', 'hello', 'bookings', 'enquiries', 'reception']

    async function extractFromPage(url: string): Promise<string | null> {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'PadelManual/1.0 (venue directory)' },
          signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) return null
        const html = await res.text()

        // Look for mailto: links first (most reliable)
        const mailtoMatch = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
        if (mailtoMatch) return mailtoMatch[1].toLowerCase()

        // Fall back to regex across page
        const allEmails = [...new Set((html.match(EMAIL_PATTERN) || []).map(e => e.toLowerCase()))]
          .filter(e => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.svg') && !e.includes('example.com') && !e.includes('sentry'))

        // Prefer common contact prefixes
        const priorityEmail = allEmails.find(e =>
          PRIORITY_PREFIXES.some(p => e.startsWith(p + '@'))
        )
        if (priorityEmail) return priorityEmail

        return allEmails[0] || null
      } catch {
        return null
      }
    }

    // Try homepage first
    const fromHomepage = await extractFromPage(websiteUrl)
    if (fromHomepage) return fromHomepage

    // Try /contact page
    try {
      const base = new URL(websiteUrl)
      const contactUrl = `${base.origin}/contact`
      return await extractFromPage(contactUrl)
    } catch {
      return null
    }
  }

  // Find unclaimed venues with leads in the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: recentLeads } = await supabase
    .from('listing_leads')
    .select('listing_id')
    .gte('created_at', thirtyDaysAgo)

  if (!recentLeads || recentLeads.length === 0) {
    return NextResponse.json({ message: 'No recent leads found', sent: 0 })
  }

  // Unique listing IDs with recent leads
  const listingIds = [...new Set(recentLeads.map(l => l.listing_id))]

  // Get unclaimed venues from those listings
  const { data: venues } = await supabase
    .from('listings')
    .select('id, name, slug, email, contact_email, view_count, website_url, google_place_id, manually_outreached_at')
    .in('id', listingIds)
    .neq('claimed', true)
    .neq('permanently_closed', true)

  if (!venues || venues.length === 0) {
    return NextResponse.json({ message: 'No unclaimed venues with leads', sent: 0 })
  }

  // Check outreach_log to avoid double-emailing
  const { data: alreadySent } = await supabase
    .from('outreach_log')
    .select('listing_id')
    .in('listing_id', venues.map(v => v.id))
    .eq('type', 'outreach')
    .in('status', ['sent', 'pending'])

  const sentIds = new Set((alreadySent || []).map(r => r.listing_id))

  // Skip venues manually outreached within the last 30 days
  const eligible = venues.filter(v => {
    if (sentIds.has(v.id)) return false
    if (v.manually_outreached_at) {
      const manualDate = new Date(v.manually_outreached_at).getTime()
      if (Date.now() - manualDate < 30 * 24 * 60 * 60 * 1000) return false
    }
    return true
  })

  let sent = 0
  let skipped = 0
  const maxPerWeek = 10

  for (const venue of eligible.slice(0, maxPerWeek)) {
    let email = venue.contact_email || venue.email

    // Auto-scrape contact email if none found
    if (!email && venue.website_url) {
      email = await scrapeContactEmail(venue.website_url)
      if (email) {
        // Store found email for future use
        await supabase
          .from('listings')
          .update({ email })
          .eq('id', venue.id)
      }
    }

    // Fallback: try Google Places for website, then scrape that
    if (!email && venue.google_place_id) {
      try {
        const placesKey = process.env.GOOGLE_PLACES_API_KEY
        if (placesKey) {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${venue.google_place_id}&fields=website&key=${placesKey}`
          const detailsRes = await fetch(detailsUrl)
          const detailsData = await detailsRes.json()
          const website = detailsData.result?.website
          if (website) {
            email = await scrapeContactEmail(website)
            if (email) {
              await supabase
                .from('listings')
                .update({ email, website_url: website })
                .eq('id', venue.id)
            }
          }
        }
      } catch {
        // Silently continue
      }
    }

    if (!email) {
      await supabase.from('outreach_log').insert({
        listing_id: venue.id,
        email: null,
        type: 'outreach',
        status: 'no_contact',
        notes: 'No contact email found (auto-scrape attempted)',
      })
      skipped++
      continue
    }

    const template = outreachEmail({
      venueName: venue.name,
      viewCount: venue.view_count || 0,
      claimSlug: venue.slug,
    })

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Liam at Padel Manual <hello@padelmanual.com>',
          to: [email],
          subject: template.subject,
          text: template.text,
        }),
      })

      await supabase.from('outreach_log').insert({
        listing_id: venue.id,
        email,
        type: 'outreach',
        status: res.ok ? 'sent' : 'failed',
        sent_at: res.ok ? new Date().toISOString() : null,
        notes: res.ok ? null : `HTTP ${res.status}`,
      })

      if (res.ok) sent++
    } catch (err) {
      await supabase.from('outreach_log').insert({
        listing_id: venue.id,
        email,
        type: 'outreach',
        status: 'failed',
        notes: String(err),
      })
    }
  }

  // Send weekly summary to admin
  const totalWithLeads = listingIds.length
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Padel Manual <hello@padelmanual.com>',
      to: ['hello@padelmanual.com'],
      subject: `Outreach summary: ${sent} sent, ${skipped} skipped`,
      text: `Weekly outreach summary:\n\n- Venues with leads (last 30 days): ${totalWithLeads}\n- Emails sent this week: ${sent}\n- Skipped (no contact): ${skipped}\n- Already contacted: ${sentIds.size}\n- Eligible remaining: ${eligible.length - sent - skipped}`,
    }),
  })

  return NextResponse.json({ sent, skipped, total: eligible.length })
}
