import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { outreachEmail } from '@/../emails/outreach-templates'

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * Automated outreach to unclaimed venues.
 * Runs weekdays at 9am UTC via Vercel Cron, or triggered from admin dashboard.
 *
 * Query params:
 *   batch_size  — how many to send (default 50, max 100)
 *   preview     — if "true", return eligible count without sending
 */
export async function GET(request: NextRequest) {
  // Auth: accept cron secret OR admin cookie
  const authHeader = request.headers.get('authorization')
  const adminCookie = request.cookies.get('admin_secret')?.value
  const cronOk = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const adminOk = adminCookie === process.env.ADMIN_SECRET

  if (!cronOk && !adminOk) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 500 })
  }

  const batchSize = Math.min(
    Math.max(parseInt(request.nextUrl.searchParams.get('batch_size') || '50') || 50, 1),
    100,
  )
  const isPreview = request.nextUrl.searchParams.get('preview') === 'true'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
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

        const mailtoMatch = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
        if (mailtoMatch) return mailtoMatch[1].toLowerCase()

        const allEmails = [...new Set((html.match(EMAIL_PATTERN) || []).map(e => e.toLowerCase()))]
          .filter(e => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.svg') && !e.includes('example.com') && !e.includes('sentry'))

        const priorityEmail = allEmails.find(e =>
          PRIORITY_PREFIXES.some(p => e.startsWith(p + '@')),
        )
        if (priorityEmail) return priorityEmail
        return allEmails[0] || null
      } catch {
        return null
      }
    }

    const fromHomepage = await extractFromPage(websiteUrl)
    if (fromHomepage) return fromHomepage

    try {
      const base = new URL(websiteUrl)
      return await extractFromPage(`${base.origin}/contact`)
    } catch {
      return null
    }
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // ── Get recent lead counts per listing ──
  const { data: recentLeads } = await supabase
    .from('listing_leads')
    .select('listing_id')
    .gte('created_at', thirtyDaysAgo)

  const leadCounts: Record<string, number> = {}
  for (const l of recentLeads || []) {
    leadCounts[l.listing_id] = (leadCounts[l.listing_id] || 0) + 1
  }

  // ── Get all unclaimed, non-closed venues with an email ──
  const { data: venues } = await supabase
    .from('listings')
    .select('id, name, slug, email, contact_email, view_count, city, website_url, google_place_id, manually_outreached_at')
    .neq('claimed', true)
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .or('email.neq.null,contact_email.neq.null')
    .limit(2000)

  if (!venues || venues.length === 0) {
    return NextResponse.json({ message: 'No eligible venues', eligible: 0, sent: 0 })
  }

  // ── Filter out already-sent and recently manually-outreached ──
  const venueIds = venues.map(v => v.id)
  const { data: alreadySent } = await supabase
    .from('outreach_log')
    .select('listing_id')
    .in('listing_id', venueIds)
    .eq('type', 'outreach')
    .in('status', ['sent', 'pending'])

  const sentIds = new Set((alreadySent || []).map(r => r.listing_id))

  const eligible = venues.filter(v => {
    if (sentIds.has(v.id)) return false
    if (v.manually_outreached_at) {
      const manualDate = new Date(v.manually_outreached_at).getTime()
      if (Date.now() - manualDate < 30 * 24 * 60 * 60 * 1000) return false
    }
    return true
  })

  // ── Priority sort ──
  eligible.sort((a, b) => {
    const aLeads = leadCounts[a.id] || 0
    const bLeads = leadCounts[b.id] || 0
    // 1. Venues with leads first (desc)
    if (aLeads !== bLeads) return bLeads - aLeads
    // 2. Higher view counts first
    const aViews = a.view_count || 0
    const bViews = b.view_count || 0
    if (aViews !== bViews) return bViews - aViews
    // 3. Alphabetically by city
    return (a.city || '').localeCompare(b.city || '')
  })

  // ── Preview mode: just return the count ──
  if (isPreview) {
    return NextResponse.json({
      eligible: eligible.length,
      with_leads: eligible.filter(v => (leadCounts[v.id] || 0) > 0).length,
      batch_size: batchSize,
    })
  }

  // ── Send batch ──
  let sent = 0
  let skipped = 0
  const batch = eligible.slice(0, batchSize)

  for (const venue of batch) {
    let email = venue.contact_email || venue.email

    // Auto-scrape if no email
    if (!email && venue.website_url) {
      email = await scrapeContactEmail(venue.website_url)
      if (email) {
        await supabase.from('listings').update({ email }).eq('id', venue.id)
      }
    }

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
              await supabase.from('listings').update({ email, website_url: website }).eq('id', venue.id)
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
        notes: String(err).slice(0, 500),
      })
    }
  }

  const remaining = eligible.length - batch.length

  // Summary email to admin
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Padel Manual <hello@padelmanual.com>',
      to: ['hello@padelmanual.com'],
      subject: `Outreach: ${sent} sent, ${skipped} skipped, ${remaining} remaining`,
      text: `Outreach batch summary:\n\n- Batch size: ${batchSize}\n- Emails sent: ${sent}\n- Skipped (no contact): ${skipped}\n- Remaining eligible: ${remaining}\n- Total venues checked: ${venues.length}`,
    }),
  })

  return NextResponse.json({
    sent,
    skipped,
    batch_size: batchSize,
    eligible: eligible.length,
    remaining,
  })
}
