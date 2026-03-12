import { NextRequest, NextResponse } from 'next/server'
import { outreachEmail, featuredTrialEmail, trialFollowupEmail } from '@/../emails/outreach-templates'

export const runtime = 'nodejs'

const TO = 'hello@padelmanual.com'
const VENUE_NAME = 'The Padel Club London'
const SITE_URL = 'https://www.padelmanual.com'

async function send(
  resendKey: string,
  from: string,
  subject: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [TO], subject, text }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return { ok: false, error: data.message || res.statusText }
  }
  return { ok: true }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  const results: { email: string; subject: string; status: string; error?: string }[] = []

  // 1. Outreach email (unclaimed venue with leads)
  const outreach = outreachEmail({
    venueName: VENUE_NAME,
    viewCount: 1243,
    claimSlug: 'the-padel-club-london',
  })
  const r1 = await send(resendKey, 'Liam at Padel Manual <hello@padelmanual.com>', outreach.subject, outreach.text)
  results.push({ email: 'outreach', subject: outreach.subject, status: r1.ok ? 'sent' : 'failed', error: r1.error })

  // 2. Featured venue trial email
  const featured = featuredTrialEmail({ venueName: VENUE_NAME })
  const r2 = await send(resendKey, 'Liam at Padel Manual <hello@padelmanual.com>', featured.subject, featured.text)
  results.push({ email: 'featured_trial', subject: featured.subject, status: r2.ok ? 'sent' : 'failed', error: r2.error })

  // 3. Trial follow-up (day 6)
  const followup = trialFollowupEmail({
    venueName: VENUE_NAME,
    viewCount: 847,
    clickCount: 23,
    leadCount: 4,
  })
  const r3 = await send(resendKey, 'Liam at Padel Manual <hello@padelmanual.com>', followup.subject, followup.text)
  results.push({ email: 'trial_followup', subject: followup.subject, status: r3.ok ? 'sent' : 'failed', error: r3.error })

  // 4. Weekly stats email (premium owner)
  const weeklySubject = `Weekly stats for ${VENUE_NAME}`
  const weeklyText = [
    `Hi Liam,`,
    ``,
    `Here's your weekly stats for ${VENUE_NAME}:`,
    ``,
    `Listing views: 2,341 (all time)`,
    `Booking clicks: 187 (all time)`,
    `Player leads this week: 6`,
    `Total leads: 43`,
    ``,
    `View your full dashboard:`,
    `${SITE_URL}/venue/dashboard`,
    ``,
    `Your live listing:`,
    `${SITE_URL}/the-padel-club-london`,
    ``,
    `—`,
    `Padel Manual`,
    `padelmanual.com`,
  ].join('\n')
  const r4 = await send(resendKey, 'Padel Manual <hello@padelmanual.com>', weeklySubject, weeklyText)
  results.push({ email: 'weekly_stats', subject: weeklySubject, status: r4.ok ? 'sent' : 'failed', error: r4.error })

  // 5. New lead notification
  const leadSubject = `New enquiry for ${VENUE_NAME}`
  const leadText = [
    `Hi Liam,`,
    ``,
    `You have a new player enquiry on Padel Manual:`,
    ``,
    `Name: Sarah`,
    `Email: sarah@example.com`,
    `Interest: Booking`,
    `Message: Hi, do you have any courts available this Saturday afternoon? Looking to book for 4 players.`,
    ``,
    `View all leads in your dashboard:`,
    `${SITE_URL}/venue/dashboard/leads`,
    ``,
    `—`,
    `Padel Manual`,
  ].join('\n')
  const r5 = await send(resendKey, 'Padel Manual <hello@padelmanual.com>', leadSubject, leadText)
  results.push({ email: 'new_lead', subject: leadSubject, status: r5.ok ? 'sent' : 'failed', error: r5.error })

  // 6. Venue submission confirmation
  const submissionSubject = `We've received your venue submission`
  const submissionText = `Hi Alex,\n\nThanks for submitting ${VENUE_NAME} to Padel Manual.\n\nWe'll review it and add your venue within 48 hours. Once it's live, you'll be able to claim it and access your dashboard.\n\nIf you have any questions, just reply to this email.\n\n—\nLiam\nPadel Manual\npadelmanual.com`
  const r6 = await send(resendKey, 'Padel Manual <hello@padelmanual.com>', submissionSubject, submissionText)
  results.push({ email: 'venue_submission', subject: submissionSubject, status: r6.ok ? 'sent' : 'failed', error: r6.error })

  const sentCount = results.filter(r => r.status === 'sent').length

  return NextResponse.json({
    to: TO,
    sent: sentCount,
    failed: results.length - sentCount,
    results,
  })
}
