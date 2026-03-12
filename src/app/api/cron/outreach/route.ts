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
    .select('id, name, slug, email, contact_email, view_count')
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
  const eligible = venues.filter(v => !sentIds.has(v.id))

  let sent = 0
  let skipped = 0
  const maxPerWeek = 10

  for (const venue of eligible.slice(0, maxPerWeek)) {
    const email = venue.contact_email || venue.email
    if (!email) {
      await supabase.from('outreach_log').insert({
        listing_id: venue.id,
        email: null,
        type: 'outreach',
        status: 'no_contact',
        notes: 'No contact email found',
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
