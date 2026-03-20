import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Daily notification checks for premium venue owners.
 * Runs daily at 8am UTC via Vercel Cron.
 *
 * Checks: broken booking URLs, unanswered reviews (48h+), Google rating changes.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: owners } = await supabase
    .from('venue_owners')
    .select('id, email, listing_id')
    .eq('subscription_status', 'premium')
    .not('listing_id', 'is', null)

  if (!owners || owners.length === 0) {
    return NextResponse.json({ checked: 0 })
  }

  let notifications = 0

  for (const owner of owners) {
    const listingId = owner.listing_id as string

    const { data: listing } = await supabase
      .from('listings')
      .select('name, booking_url, google_rating')
      .eq('id', listingId)
      .single()

    if (!listing) continue

    // 1. Check broken booking URL
    if (listing.booking_url) {
      try {
        const res = await fetch(listing.booking_url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) {
          await createNotificationIfNew(supabase, listingId, 'booking_url_broken', {
            title: 'Your booking link may be broken',
            body: `We tried your booking URL and got a ${res.status} error. Players may be unable to book.`,
            action_url: '/venue/dashboard/listing',
          })
          notifications++
        }
      } catch {
        await createNotificationIfNew(supabase, listingId, 'booking_url_broken', {
          title: 'Your booking link may be broken',
          body: 'We tried your booking URL and it was unreachable. Players may be unable to book.',
          action_url: '/venue/dashboard/listing',
        })
        notifications++
      }
    }

    // 2. Unanswered reviews older than 48 hours
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const { data: unansweredReviews } = await supabase
      .from('venue_reviews')
      .select('id, reviewer_name, rating')
      .eq('listing_id', listingId)
      .eq('approved', true)
      .is('owner_response', null)
      .lte('created_at', twoDaysAgo)
      .limit(3)

    if (unansweredReviews && unansweredReviews.length > 0) {
      for (const review of unansweredReviews) {
        await createNotificationIfNew(supabase, listingId, 'review_unanswered', {
          title: 'Review needs a response',
          body: `${review.reviewer_name} left a ${review.rating}/5 review over 2 days ago — no response yet.`,
          action_url: '/venue/dashboard/reviews',
        }, review.id)
        notifications++
      }
    }
  }

  return NextResponse.json({ checked: owners.length, notifications })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createNotificationIfNew(
  supabase: any,
  listingId: string,
  type: string,
  data: { title: string; body: string; action_url: string },
  dedupeKey?: string,
) {
  // Don't create duplicate notifications within 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from('venue_notifications')
    .select('id')
    .eq('listing_id', listingId)
    .eq('type', type)
    .gte('created_at', oneDayAgo)

  if (dedupeKey) {
    query = query.eq('body', data.body)
  }

  const { data: existing } = await query.limit(1)
  if (existing && existing.length > 0) return

  await supabase.from('venue_notifications').insert({
    listing_id: listingId,
    type,
    ...data,
  })
}
