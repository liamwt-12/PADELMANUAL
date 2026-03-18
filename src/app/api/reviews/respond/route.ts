import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { review_id, response_text, owner_email } = body

    if (!review_id || !response_text?.trim() || !owner_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (response_text.trim().length > 280) {
      return NextResponse.json({ error: 'Response must be 280 characters or less' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Get the review and its listing
    const { data: review } = await supabase
      .from('venue_reviews')
      .select('id, listing_id')
      .eq('id', review_id)
      .single()

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Verify the owner owns this listing
    const { data: owner } = await supabase
      .from('venue_owners')
      .select('id, subscription_status')
      .eq('email', owner_email)
      .eq('listing_id', review.listing_id)
      .single()

    if (!owner) {
      return NextResponse.json({ error: 'Not authorised to respond to this review' }, { status: 403 })
    }

    if (owner.subscription_status !== 'premium' && owner.subscription_status !== 'trial') {
      return NextResponse.json({ error: 'Premium subscription required to respond to reviews' }, { status: 403 })
    }

    await supabase
      .from('venue_reviews')
      .update({
        owner_response: response_text.trim(),
        owner_responded_at: new Date().toISOString(),
      })
      .eq('id', review_id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
