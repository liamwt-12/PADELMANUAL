import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { refreshAccessToken } from '@/lib/gbp'

export const runtime = 'nodejs'
export const maxDuration = 120

/**
 * Weekly GBP post generation.
 * Runs every Thursday at 10am UTC via Vercel Cron.
 *
 * For each premium venue with GBP connected, generates an AI post
 * about weekend availability and queues it for approval.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: owners } = await supabase
    .from('venue_owners')
    .select('id, email, listing_id, gbp_access_token, gbp_refresh_token, gbp_account_id, gbp_location_id, gbp_auto_approve_posts')
    .eq('subscription_status', 'premium')
    .not('listing_id', 'is', null)
    .not('gbp_connected_at', 'is', null)

  if (!owners || owners.length === 0) {
    return NextResponse.json({ generated: 0 })
  }

  let generated = 0

  for (const owner of owners) {
    try {
      const listingId = owner.listing_id as string

      const { data: listing } = await supabase
        .from('listings')
        .select('name, city, playtomic_tenant_id, price_per_hour_peak, price_per_hour_offpeak, booking_url, booking_platform, courts')
        .eq('id', listingId)
        .single()

      if (!listing) continue

      // Check weekend availability from Playtomic if available
      let availabilityInfo = ''
      if (listing.playtomic_tenant_id) {
        try {
          const saturday = getNextDay(6) // Saturday
          const sunday = getNextDay(0) // Sunday

          const satSlots = await fetchPlaytomicSlots(listing.playtomic_tenant_id, saturday)
          const sunSlots = await fetchPlaytomicSlots(listing.playtomic_tenant_id, sunday)

          availabilityInfo = `Saturday: ${satSlots} slots available. Sunday: ${sunSlots} slots available.`
        } catch {
          availabilityInfo = 'Weekend availability varies.'
        }
      }

      const minPrice = listing.price_per_hour_offpeak || listing.price_per_hour_peak
      const bookingMethod = listing.booking_platform || (listing.booking_url ? 'Online booking' : 'Contact venue')

      const prompt = `Write a short Google Business Profile post for a padel venue.
Tone: warm, human, not corporate. Under 100 words.
Include: specific availability information if provided, call to action.
Never use: "amazing", "fantastic", "world-class", exclamation marks.

Venue: ${listing.name}, ${listing.city || 'UK'}
Courts: ${listing.courts || 'Multiple'}
This weekend availability: ${availabilityInfo || 'Courts available this weekend.'}
${minPrice ? `Price from: £${minPrice}/hr` : ''}
Booking method: ${bookingMethod}

Write only the post text, nothing else.`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) continue

      const result = await res.json()
      const postText = result.content?.[0]?.text?.trim() || ''
      if (!postText) continue

      // Check if auto-approve is enabled and the owner has approved 3+ previous posts
      const shouldAutoApprove = owner.gbp_auto_approve_posts
      let autoPosted = false

      if (shouldAutoApprove) {
        const { count: approvedCount } = await supabase
          .from('gbp_posts_queue')
          .select('*', { count: 'exact', head: true })
          .eq('listing_id', listingId)
          .in('status', ['posted', 'approved'])

        if ((approvedCount || 0) >= 3 && owner.gbp_refresh_token && owner.gbp_location_id && owner.gbp_account_id) {
          // Auto-post to Google
          try {
            const refreshed = await refreshAccessToken(owner.gbp_refresh_token as string)

            const gbpRes = await fetch(
              `https://mybusiness.googleapis.com/v4/${owner.gbp_account_id}/${owner.gbp_location_id}/localPosts`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${refreshed.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  languageCode: 'en-GB',
                  summary: postText,
                  topicType: 'STANDARD',
                }),
              }
            )

            if (gbpRes.ok) {
              const gbpData = await gbpRes.json()
              await supabase.from('gbp_posts_queue').insert({
                listing_id: listingId,
                post_text: postText,
                status: 'posted',
                auto_approve: true,
                posted_at: new Date().toISOString(),
                google_post_id: gbpData.name || null,
              })
              autoPosted = true
            }
          } catch (err) {
            console.error('Auto-post to GBP failed:', err)
          }
        }
      }

      if (!autoPosted) {
        // Save as pending
        await supabase.from('gbp_posts_queue').insert({
          listing_id: listingId,
          post_text: postText,
          status: 'pending',
          auto_approve: false,
        })

        // Create notification
        await supabase.from('venue_notifications').insert({
          listing_id: listingId,
          type: 'gbp_post_ready',
          title: 'Your weekly Google post is ready',
          body: 'Review and approve your AI-generated post before the weekend.',
          action_url: '/venue/dashboard/gbp',
        })
      }

      generated++
    } catch (err) {
      console.error(`GBP post generation failed for ${owner.email}:`, err)
    }
  }

  return NextResponse.json({ generated })
}

function getNextDay(targetDay: number): string {
  const today = new Date()
  const diff = (targetDay + 7 - today.getDay()) % 7 || 7
  const next = new Date(today.getTime() + diff * 24 * 60 * 60 * 1000)
  return next.toISOString().split('T')[0]
}

async function fetchPlaytomicSlots(tenantId: string, date: string): Promise<number> {
  const res = await fetch(
    `https://playtomic.io/api/v1/availability?user_id=me&tenant_id=${tenantId}&sport_id=PADEL&local_start_min=${date}T08:00:00&local_start_max=${date}T22:00:00`,
    { signal: AbortSignal.timeout(5000) }
  )
  if (!res.ok) return 0
  const data = await res.json()
  return Array.isArray(data) ? data.length : 0
}
