import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { refreshAccessToken, fetchInsights } from '@/lib/gbp'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Get authenticated user
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

  // Get venue owner with GBP tokens
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  const listingId = request.nextUrl.searchParams.get('listing_id')
  let ownerQuery = supabase
    .from('venue_owners')
    .select('id, gbp_access_token, gbp_refresh_token, gbp_location_id')
    .eq('email', user.email)
  if (listingId) ownerQuery = ownerQuery.eq('listing_id', listingId)
  const { data: owners } = await ownerQuery.limit(1)
  const owner = owners?.[0] || null

  if (!owner?.gbp_refresh_token || !owner?.gbp_location_id) {
    return NextResponse.json({ error: 'GBP not connected' }, { status: 404 })
  }

  // Always refresh the access token (they expire after 1 hour)
  let accessToken = owner.gbp_access_token
  try {
    const refreshed = await refreshAccessToken(owner.gbp_refresh_token)
    accessToken = refreshed.access_token

    // Store the new access token
    await supabase
      .from('venue_owners')
      .update({ gbp_access_token: accessToken })
      .eq('id', owner.id)
  } catch (err) {
    console.error('GBP token refresh failed:', err)
    // Try with existing token — it might still be valid
  }

  // Fetch insights
  try {
    const insights = await fetchInsights(accessToken!, owner.gbp_location_id)
    return NextResponse.json(insights)
  } catch (err) {
    console.error('GBP insights fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 502 })
  }
}
