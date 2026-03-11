import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { listing_id, player_name, player_email, interest_type, player_message } = body

    if (!listing_id || !player_name || !player_email?.includes('@')) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )

    const { error } = await supabase
      .from('listing_leads')
      .insert({
        listing_id,
        player_name,
        player_email,
        interest_type: interest_type || 'general',
        player_message: player_message || null,
        contacted: false,
      })

    if (error) {
      console.error('Listing lead insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Look up listing details
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const { data: listing } = await supabase
        .from('listings')
        .select('name, slug, claimed')
        .eq('id', listing_id)
        .single()

      const { data: owner } = await supabase
        .from('venue_owners')
        .select('email, name')
        .eq('listing_id', listing_id)
        .single()

      const venueName = listing?.name || 'a venue'
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.padelmanual.com'

      const leadDetails = [
        `Name: ${player_name}`,
        `Email: ${player_email}`,
        `Interest: ${interest_type || 'General'}`,
        player_message ? `Message: ${player_message}` : '',
      ].filter(Boolean).join('\n')

      if (owner?.email && listing?.claimed) {
        // Claimed venue — notify the owner
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Padel Manual <hello@padelmanual.com>',
            to: [owner.email],
            subject: `New enquiry for ${venueName}`,
            text: [
              `Hi${owner.name ? ' ' + owner.name : ''},`,
              ``,
              `You have a new player enquiry on Padel Manual:`,
              ``,
              leadDetails,
              ``,
              `View all leads in your dashboard:`,
              `${siteUrl}/venue/dashboard/leads`,
              ``,
              `—`,
              `Padel Manual`,
            ].join('\n'),
          }),
        }).catch(() => {})
      } else {
        // Unclaimed venue — notify hello@ as a warm sales trigger
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Padel Manual <hello@padelmanual.com>',
            to: ['hello@padelmanual.com'],
            subject: `Lead for unclaimed venue: ${venueName}`,
            text: [
              `A player enquired about an unclaimed venue:`,
              ``,
              `Venue: ${venueName}`,
              `Listing: ${siteUrl}/${listing?.slug || ''}`,
              ``,
              leadDetails,
              ``,
              `This venue has no owner yet — reach out to claim it for them.`,
            ].join('\n'),
          }),
        }).catch(() => {})
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
