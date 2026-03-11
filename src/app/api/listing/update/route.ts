import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const FREE_FIELDS = ['website_url', 'booking_url', 'phone']
const PREMIUM_FIELDS = [
  ...FREE_FIELDS,
  'description', 'short_blurb', 'instagram_url', 'email',
  'youtube_video_url', 'announcement',
]

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await authClient.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  // Get owner + check subscription
  const { data: owner } = await supabase
    .from('venue_owners')
    .select('listing_id, subscription_status')
    .eq('email', user.email)
    .single()

  if (!owner?.listing_id) {
    return NextResponse.json({ error: 'No listing found' }, { status: 404 })
  }

  const isPremium = owner.subscription_status === 'premium' || owner.subscription_status === 'trial'
  const allowedFields = isPremium ? PREMIUM_FIELDS : FREE_FIELDS

  const body = await request.json()

  // Filter to only allowed fields with non-undefined values
  const updates: Record<string, string | null> = {}
  for (const key of allowedFields) {
    if (key in body) {
      updates[key] = body[key] === '' ? null : body[key]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', owner.listing_id)

  if (error) {
    console.error('Listing update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
