import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const resendKey = process.env.RESEND_API_KEY
    if (!serviceKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false } }
    )

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.padelmanual.com'
    const demoEmail = 'demo@manualpadel.com'

    // Ensure auth user exists for the demo account
    await supabase.auth.admin.createUser({ email: demoEmail, email_confirm: true })

    // Generate magic link for the demo account
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: demoEmail,
    })

    if (error || !data?.properties?.hashed_token) {
      console.error('Demo magic link error:', error)
      return NextResponse.json({ error: 'Could not generate demo link' }, { status: 500 })
    }

    const tokenHash = data.properties.hashed_token
    const verifyUrl = `${siteUrl}/venue/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink`

    // Send email to the recipient
    if (resendKey) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Padel Manual <hello@padelmanual.com>',
          to: [email],
          subject: 'See the Padel Manual dashboard in action',
          text: [
            `Hi,`,
            ``,
            `Here's your access to the Padel Manual demo dashboard — built around a fictional venue called Manual Padel in Battersea.`,
            ``,
            `It shows everything the dashboard can do: weekly intelligence briefs, Google Business Profile management, player leads, court utilisation, competitor intelligence, and review management.`,
            ``,
            `View the demo dashboard:`,
            verifyUrl,
            ``,
            `The full dashboard is included with every Padel Manual listing at \u00A329/month.`,
            ``,
            `— Liam`,
            `Padel Manual`,
            `padelmanual.com`,
          ].join('\n'),
        }),
      })

      if (!emailRes.ok) {
        console.error('Demo email send error:', await emailRes.text())
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, sent_to: email })
  } catch (err) {
    console.error('Send demo error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
