import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * Weekly stats email sent to premium venue owners.
 * Trigger via Vercel Cron: Monday 8am UK time.
 *
 * vercel.json:
 * { "crons": [{ "path": "/api/cron/weekly-report", "schedule": "0 8 * * 1" }] }
 *
 * Secured by CRON_SECRET header check.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
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

  // Get all premium venue owners with listings
  const { data: owners } = await supabase
    .from('venue_owners')
    .select('email, name, listing_id')
    .eq('subscription_status', 'premium')
    .not('listing_id', 'is', null)

  if (!owners || owners.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.padelmanual.com'
  let sent = 0

  for (const owner of owners) {
    try {
      // Fetch listing stats
      const { data: listing } = await supabase
        .from('listings')
        .select('name, slug, view_count, click_count')
        .eq('id', owner.listing_id)
        .single()

      if (!listing) continue

      // Count leads this week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { count: weekLeads } = await supabase
        .from('listing_leads')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', owner.listing_id)
        .gte('created_at', weekAgo.toISOString())

      const { count: totalLeads } = await supabase
        .from('listing_leads')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', owner.listing_id)

      const firstName = owner.name?.split(' ')[0] || 'there'

      const emailText = [
        `Hi ${firstName},`,
        ``,
        `Here's your weekly stats for ${listing.name}:`,
        ``,
        `Listing views: ${(listing.view_count || 0).toLocaleString()} (all time)`,
        `Booking clicks: ${(listing.click_count || 0).toLocaleString()} (all time)`,
        `Player leads this week: ${weekLeads || 0}`,
        `Total leads: ${totalLeads || 0}`,
        ``,
        `View your full dashboard:`,
        `${siteUrl}/venue/dashboard`,
        ``,
        `Your live listing:`,
        `${siteUrl}/${listing.slug}`,
        ``,
        `—`,
        `Padel Manual`,
        `padelmanual.com`,
      ].join('\n')

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Padel Manual <hello@padelmanual.com>',
          to: [owner.email],
          subject: `Weekly stats for ${listing.name}`,
          text: emailText,
        }),
      })

      sent++
    } catch (err) {
      console.error(`Weekly report failed for ${owner.email}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
