import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  outreachStep2Email,
  outreachStep3Email,
  outreachStep4Email,
} from '@/../emails/outreach-templates'

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * Outreach sequence cron — sends follow-up emails (steps 2–4).
 * Runs weekdays at 9:30am UTC, 30 mins after the main outreach cron.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const adminCookie = request.cookies.get('admin_secret')?.value
  const cronOk = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const adminOk = adminCookie === process.env.ADMIN_SECRET

  if (!cronOk && !adminOk) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  // Find all outreach rows due for their next sequence email
  const { data: dueRows, error } = await supabase
    .from('outreach_log')
    .select('id, listing_id, email, sequence_step')
    .eq('type', 'outreach')
    .eq('status', 'sent')
    .eq('sequence_completed', false)
    .eq('claimed', false)
    .lte('next_email_at', new Date().toISOString())
    .order('next_email_at', { ascending: true })

  if (error || !dueRows || dueRows.length === 0) {
    return NextResponse.json({ message: 'No sequence emails due', sent: 0 })
  }

  // Check opt-outs (fetch all to ensure case-insensitive matching)
  const { data: optouts } = await supabase.from('outreach_optouts').select('email')
  const optedOutEmails = new Set((optouts || []).map(r => r.email.toLowerCase()))

  // Get listing details for templates
  const listingIds = [...new Set(dueRows.map(r => r.listing_id).filter(Boolean))]
  const { data: listings } = listingIds.length > 0
    ? await supabase.from('listings').select('id, name, slug').in('id', listingIds)
    : { data: [] }
  const listingMap: Record<string, { name: string; slug: string }> = {}
  for (const l of listings || []) {
    listingMap[l.id] = { name: l.name, slug: l.slug }
  }

  // Check which venues have been claimed (have a venue_owners row)
  const { data: claimedOwners } = listingIds.length > 0
    ? await supabase.from('venue_owners').select('listing_id').in('listing_id', listingIds)
    : { data: [] }
  const claimedListingIds = new Set((claimedOwners || []).map(r => r.listing_id))

  let step2Sent = 0
  let step3Sent = 0
  let step4Sent = 0
  let claimedCount = 0
  let optedOutCount = 0

  for (const row of dueRows) {
    // Skip opted-out emails (case-insensitive)
    if (row.email && optedOutEmails.has(row.email.toLowerCase())) {
      await supabase.from('outreach_log').update({
        sequence_completed: true,
      }).eq('id', row.id)
      optedOutCount++
      continue
    }

    // Check if venue has been claimed
    if (row.listing_id && claimedListingIds.has(row.listing_id)) {
      await supabase.from('outreach_log').update({
        claimed: true,
        sequence_completed: true,
      }).eq('id', row.id)
      claimedCount++
      continue
    }

    const listing = row.listing_id ? listingMap[row.listing_id] : null
    if (!listing || !row.email) {
      await supabase.from('outreach_log').update({
        sequence_completed: true,
        notes: 'Skipped: missing listing or email',
      }).eq('id', row.id)
      continue
    }

    const currentStep = row.sequence_step || 1
    let template: { subject: string; text: string }
    let nextStep: number
    let nextEmailAt: string | null
    let completed: boolean

    if (currentStep === 1) {
      template = outreachStep2Email({ venueName: listing.name, claimSlug: listing.slug })
      nextStep = 2
      nextEmailAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      completed = false
    } else if (currentStep === 2) {
      template = outreachStep3Email({ venueName: listing.name })
      nextStep = 3
      nextEmailAt = new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString()
      completed = false
    } else if (currentStep === 3) {
      template = outreachStep4Email({ venueName: listing.name, claimSlug: listing.slug })
      nextStep = 4
      nextEmailAt = null
      completed = true
    } else {
      // Already at step 4 or beyond — mark complete
      await supabase.from('outreach_log').update({
        sequence_completed: true,
      }).eq('id', row.id)
      continue
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Liam at Padel Manual <hello@padelmanual.com>',
          to: [row.email],
          subject: template.subject,
          text: template.text,
        }),
      })

      if (res.ok) {
        await supabase.from('outreach_log').update({
          sequence_step: nextStep,
          next_email_at: nextEmailAt,
          sequence_completed: completed,
        }).eq('id', row.id)

        if (nextStep === 2) step2Sent++
        else if (nextStep === 3) step3Sent++
        else if (nextStep === 4) step4Sent++
      } else {
        // Don't advance on failure — will retry next run
        await supabase.from('outreach_log').update({
          notes: `Step ${nextStep} send failed: HTTP ${res.status}`,
        }).eq('id', row.id)
      }
    } catch (err) {
      await supabase.from('outreach_log').update({
        notes: `Step ${nextStep} send error: ${String(err).slice(0, 300)}`,
      }).eq('id', row.id)
    }

    // Rate limit: 1 second between sends (Resend free tier)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const totalSent = step2Sent + step3Sent + step4Sent

  // Summary email to admin
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Padel Manual <hello@padelmanual.com>',
      to: ['hello@padelmanual.com'],
      subject: `Sequence: ${totalSent} sent, ${claimedCount} claimed`,
      text: `Sequence emails sent today: ${step2Sent} step-2, ${step3Sent} step-3, ${step4Sent} step-4.\n${claimedCount} venues claimed and removed from sequence.\n${optedOutCount} opted-out venues skipped.`,
    }),
  })

  return NextResponse.json({
    sent: totalSent,
    step2: step2Sent,
    step3: step3Sent,
    step4: step4Sent,
    claimed: claimedCount,
    opted_out: optedOutCount,
  })
}
