import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function formatName(full: string): string {
  const parts = full.trim().split(/\s+/)
  if (parts.length < 2) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listing_id, name, email, rating, review_text } = body

    if (!listing_id || !name?.trim() || !email?.trim() || !rating || !review_text?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
    }

    if (review_text.trim().length > 280) {
      return NextResponse.json({ error: 'Review must be 280 characters or less' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Check duplicate: same email + listing
    const { data: existing } = await supabase
      .from('venue_reviews')
      .select('id')
      .eq('listing_id', listing_id)
      .eq('reviewer_email', email.toLowerCase().trim())
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "You've already reviewed this venue" }, { status: 409 })
    }

    // Rate limit: max 3 reviews per email per day
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: todayCount } = await supabase
      .from('venue_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('reviewer_email', email.toLowerCase().trim())
      .gte('created_at', dayAgo)

    if ((todayCount || 0) >= 3) {
      return NextResponse.json({ error: 'Too many reviews today. Try again tomorrow.' }, { status: 429 })
    }

    const displayName = formatName(name)

    const { data: review, error: insertError } = await supabase
      .from('venue_reviews')
      .insert({
        listing_id,
        reviewer_name: displayName,
        reviewer_email: email.toLowerCase().trim(),
        rating,
        review_text: review_text.trim(),
        approved: true,
      })
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Update listing aggregate stats
    await supabase.rpc('update_listing_review_stats', { p_listing_id: listing_id })

    // Get venue name for notification
    const { data: listing } = await supabase
      .from('listings')
      .select('name')
      .eq('id', listing_id)
      .single()

    // Notify admin
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
          subject: `New review for ${listing?.name || 'venue'}: ${rating}/5`,
          text: `New review:\n\nVenue: ${listing?.name || listing_id}\nRating: ${rating}/5\nReviewer: ${displayName}\nReview: ${review_text.trim().slice(0, 200)}`,
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, review_id: review.id })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
