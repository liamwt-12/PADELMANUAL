import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { listing_id, report_type, reporter_email, notes } = body

    if (!listing_id || !report_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Insert the report
    const { error } = await supabase
      .from('listing_reports')
      .insert({
        listing_id,
        report_type,
        reporter_email: reporter_email || null,
        notes: notes || null,
      })

    if (error) {
      console.error('Report insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get listing name for emails
    const { data: listing } = await supabase
      .from('listings')
      .select('name, slug')
      .eq('id', listing_id)
      .single()

    const venueName = listing?.name || 'Unknown venue'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.padelmanual.com'

    // For "permanently_closed" reports, check if threshold reached
    if (report_type === 'permanently_closed') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('listing_reports')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', listing_id)
        .eq('report_type', 'permanently_closed')
        .gte('created_at', thirtyDaysAgo)

      if (count && count >= 3) {
        // Auto-flag as closed
        await supabase
          .from('listings')
          .update({
            permanently_closed: true,
            closed_at: new Date().toISOString(),
          })
          .eq('id', listing_id)

        // Notify admin
        const resendKey = process.env.RESEND_API_KEY
        if (resendKey) {
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Padel Manual <hello@padelmanual.com>',
              to: ['hello@padelmanual.com'],
              subject: `Auto-flagged: ${venueName} reported as permanently closed`,
              text: [
                `3 users have reported ${venueName} as permanently closed in the last 30 days.`,
                ``,
                `The listing has been auto-flagged as closed.`,
                ``,
                `Review: ${siteUrl}/${listing?.slug || ''}`,
                `Admin: ${siteUrl}/venue/admin`,
              ].join('\n'),
            }),
          }).catch(() => {})
        }
      }
    } else {
      // For other report types, just email admin
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Padel Manual <hello@padelmanual.com>',
            to: ['hello@padelmanual.com'],
            subject: `Listing report: ${venueName}`,
            text: [
              `A user reported an issue with ${venueName}:`,
              ``,
              `Type: ${report_type}`,
              reporter_email ? `Reporter: ${reporter_email}` : '',
              notes ? `Notes: ${notes}` : '',
              ``,
              `Review: ${siteUrl}/${listing?.slug || ''}`,
              `Admin: ${siteUrl}/venue/admin`,
            ].filter(Boolean).join('\n'),
          }),
        }).catch(() => {})
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Report error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
