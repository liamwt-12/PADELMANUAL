import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const buttondownKey = process.env.BUTTONDOWN_API_KEY
  if (!buttondownKey) {
    return NextResponse.json({ error: 'Newsletter not configured' }, { status: 500 })
  }

  try {
    // Subscribe via Buttondown
    const bdRes = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${buttondownKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        tags: ['player'],
      }),
    })

    // 201 = new subscriber, 200 = already exists — both are fine
    if (!bdRes.ok && bdRes.status !== 409) {
      const err = await bdRes.text()
      return NextResponse.json({ error: 'Subscription failed', detail: err }, { status: 500 })
    }

    // Notify admin via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Padel Manual <hello@padelmanual.com>',
          to: ['hello@padelmanual.com'],
          subject: `New player subscriber: ${email}`,
          text: `New player email signup: ${email}`,
        }),
      }).catch(() => {}) // Don't fail the request if notification fails
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 })
  }
}
