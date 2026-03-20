import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const listingId = request.nextUrl.searchParams.get('listing_id')
  if (!listingId) {
    return NextResponse.json({ error: 'listing_id required' }, { status: 400 })
  }

  // Verify ownership
  const { data: ownerCheck } = await supabase
    .from('venue_owners')
    .select('id')
    .eq('email', user.email)
    .eq('listing_id', listingId)
    .limit(1)

  if (!ownerCheck || ownerCheck.length === 0) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Fetch briefs
  const { data: briefs } = await supabase
    .from('intelligence_briefs')
    .select('*')
    .eq('listing_id', listingId)
    .order('week_start', { ascending: false })
    .limit(5)

  // Mark the latest as read if not already
  if (briefs && briefs.length > 0 && !briefs[0].read_at) {
    await supabase
      .from('intelligence_briefs')
      .update({ read_at: new Date().toISOString() })
      .eq('id', briefs[0].id)
  }

  return NextResponse.json({ briefs: briefs || [] })
}
