import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { featuredTrialEmail } from '@/../emails/outreach-templates'

export const runtime = 'nodejs'

/**
 * Automatically feature one unclaimed venue per week with a 7-day trial.
 * Runs every Monday at 8am UTC via Vercel Cron (before outreach).
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

  // Get all unclaimed venues with stats
  const { data: venues } = await supabase
    .from('listings')
    .select('id, name, slug, email, contact_email, view_count, playtomic_tenant_id')
    .neq('claimed', true)
    .neq('permanently_closed', true)
    .eq('listing_type', 'venue')

  if (!venues || venues.length === 0) {
    return NextResponse.json({ message: 'No eligible venues' })
  }

  // Get lead counts per listing
  const { data: leadCounts } = await supabase
    .from('listing_leads')
    .select('listing_id')

  const leadMap: Record<string, number> = {}
  for (const row of leadCounts || []) {
    leadMap[row.listing_id] = (leadMap[row.listing_id] || 0) + 1
  }

  // Get venues featured in the last 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentlyFeatured } = await supabase
    .from('venue_owners')
    .select('listing_id')
    .not('featured_at', 'is', null)
    .gte('featured_at', ninetyDaysAgo)

  const recentlyFeaturedIds = new Set((recentlyFeatured || []).map(r => r.listing_id))

  // Score and rank venues
  const scored = venues
    .filter(v => !recentlyFeaturedIds.has(v.id))
    .map(v => {
      const views = v.view_count || 0
      const hasPlaytomic = v.playtomic_tenant_id ? 1 : 0
      const leads = leadMap[v.id] || 0
      // Weighted score: views 40%, playtomic 20%, leads 40%
      const score = (views * 0.4) + (hasPlaytomic * 200 * 0.2) + (leads * 100 * 0.4)
      return { ...v, score, leads }
    })
    .sort((a, b) => b.score - a.score)

  const winner = scored[0]
  if (!winner) {
    return NextResponse.json({ message: 'No eligible venues after filtering' })
  }

  // Create or update venue_owner row with trial
  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const contactEmail = winner.contact_email || winner.email || 'hello@padelmanual.com'

  const { data: existingOwner } = await supabase
    .from('venue_owners')
    .select('id')
    .eq('listing_id', winner.id)
    .maybeSingle()

  if (existingOwner) {
    await supabase
      .from('venue_owners')
      .update({
        subscription_status: 'trial',
        trial_ends_at: trialEnd,
        featured_at: new Date().toISOString(),
      })
      .eq('id', existingOwner.id)
  } else {
    await supabase
      .from('venue_owners')
      .insert({
        email: contactEmail,
        listing_id: winner.id,
        subscription_status: 'trial',
        trial_ends_at: trialEnd,
        featured_at: new Date().toISOString(),
      })
  }

  // Send featured email
  const template = featuredTrialEmail({ venueName: winner.name })

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Liam at Padel Manual <hello@padelmanual.com>',
      to: [contactEmail],
      subject: template.subject,
      text: template.text,
    }),
  })

  // Log the featured trial
  await supabase.from('outreach_log').insert({
    listing_id: winner.id,
    email: contactEmail,
    type: 'featured_trial',
    status: 'sent',
    sent_at: new Date().toISOString(),
  })

  // Schedule day-6 follow-up
  const followupDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
  await supabase.from('outreach_log').insert({
    listing_id: winner.id,
    email: contactEmail,
    type: 'trial_followup',
    status: 'pending',
    send_at: followupDate,
  })

  // Notify admin
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Padel Manual <hello@padelmanual.com>',
      to: ['hello@padelmanual.com'],
      subject: `Featured venue this week: ${winner.name}`,
      text: `This week's featured venue: ${winner.name}\n\nSlug: ${winner.slug}\nScore: ${winner.score.toFixed(0)}\nViews: ${winner.view_count || 0}\nLeads: ${winner.leads}\nEmail: ${contactEmail}\nTrial ends: ${trialEnd}`,
    }),
  })

  return NextResponse.json({ featured: winner.name, email: contactEmail, trialEnd })
}
