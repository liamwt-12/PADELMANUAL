import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { trialFollowupEmail } from '@/../emails/outreach-templates'

export const runtime = 'nodejs'

/**
 * Daily check for trial follow-ups to send and expired trials to downgrade.
 * Runs every day at 9am UTC via Vercel Cron.
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

  const now = new Date().toISOString()

  // 1. Find pending trial follow-ups due today
  const { data: pendingFollowups } = await supabase
    .from('outreach_log')
    .select('*')
    .eq('type', 'trial_followup')
    .eq('status', 'pending')
    .lte('send_at', now)

  let followupsSent = 0

  for (const followup of pendingFollowups || []) {
    if (!followup.listing_id || !followup.email) continue

    // Get listing stats for the trial period
    const { data: listing } = await supabase
      .from('listings')
      .select('name, view_count, click_count')
      .eq('id', followup.listing_id)
      .single()

    if (!listing) continue

    // Count leads during trial (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: leadCount } = await supabase
      .from('listing_leads')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', followup.listing_id)
      .gte('created_at', sevenDaysAgo)

    const template = trialFollowupEmail({
      venueName: listing.name,
      viewCount: listing.view_count || 0,
      clickCount: listing.click_count || 0,
      leadCount: leadCount || 0,
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
          to: [followup.email],
          subject: template.subject,
          text: template.text,
        }),
      })

      await supabase
        .from('outreach_log')
        .update({
          status: res.ok ? 'sent' : 'failed',
          sent_at: res.ok ? now : null,
        })
        .eq('id', followup.id)

      if (res.ok) followupsSent++
    } catch {
      await supabase
        .from('outreach_log')
        .update({ status: 'failed' })
        .eq('id', followup.id)
    }
  }

  // 2. Downgrade expired trials
  const { data: expiredTrials } = await supabase
    .from('venue_owners')
    .select('id, email, listing_id')
    .eq('subscription_status', 'trial')
    .lt('trial_ends_at', now)

  let downgraded = 0

  for (const trial of expiredTrials || []) {
    await supabase
      .from('venue_owners')
      .update({ subscription_status: 'free' })
      .eq('id', trial.id)
    downgraded++
  }

  return NextResponse.json({
    followupsSent,
    downgraded,
    pendingChecked: (pendingFollowups || []).length,
  })
}
