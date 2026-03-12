import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      venue_name,
      city,
      postcode,
      contact_name,
      contact_email,
      role,
      website_url,
      courts,
      indoor,
      referral_source,
    } = body

    if (!venue_name || !city || !contact_name || !contact_email) {
      return NextResponse.json(
        { error: 'Venue name, city, your name, and email are required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase.from('venue_submissions').insert({
      venue_name,
      city,
      postcode: postcode || null,
      contact_name,
      contact_email,
      role: role || null,
      website_url: website_url || null,
      courts: courts || null,
      indoor: indoor || null,
      referral_source: referral_source || null,
    })

    if (error) {
      console.error('venue_submissions insert error:', error)
      return NextResponse.json({ error: 'Failed to submit venue.' }, { status: 500 })
    }

    // Send emails via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      // Confirmation to submitter
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Padel Manual <hello@padelmanual.com>',
          to: [contact_email],
          subject: `We've received your venue submission`,
          text: `Hi ${contact_name},\n\nThanks for submitting ${venue_name} to Padel Manual.\n\nWe'll review it and add your venue within 48 hours. Once it's live, you'll be able to claim it and access your dashboard.\n\nIf you have any questions, just reply to this email.\n\n—\nLiam\nPadel Manual\npadelmanual.com`,
        }),
      })

      // Notification to admin
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Padel Manual <hello@padelmanual.com>',
          to: ['hello@padelmanual.com'],
          subject: `New venue submission: ${venue_name}`,
          text: `New venue submission:\n\nVenue: ${venue_name}\nCity: ${city}\nPostcode: ${postcode || 'Not provided'}\nCourts: ${courts || 'Not provided'}\nIndoor: ${indoor || 'Not provided'}\nWebsite: ${website_url || 'Not provided'}\n\nContact: ${contact_name}\nEmail: ${contact_email}\nRole: ${role || 'Not provided'}\nReferral: ${referral_source || 'Not provided'}`,
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('venue add error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
