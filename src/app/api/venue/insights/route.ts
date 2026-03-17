import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DAY_NAMES = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']

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
    return NextResponse.json({ bestDay: null })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const listingId = request.nextUrl.searchParams.get('listing_id')
  let ownerQuery = supabase
    .from('venue_owners')
    .select('listing_id')
    .eq('email', user.email)
  if (listingId) ownerQuery = ownerQuery.eq('listing_id', listingId)
  const { data: owners } = await ownerQuery.limit(1)
  const owner = owners?.[0] || null

  if (!owner?.listing_id) {
    return NextResponse.json({ bestDay: null })
  }

  // Get leads from last 90 days to determine best day
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const { data: leads } = await supabase
    .from('listing_leads')
    .select('created_at')
    .eq('listing_id', owner.listing_id)
    .gte('created_at', ninetyDaysAgo)

  if (!leads || leads.length < 7) {
    return NextResponse.json({ bestDay: null })
  }

  // Count leads by day of week
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]
  for (const lead of leads) {
    const day = new Date(lead.created_at).getDay()
    dayCounts[day]++
  }

  const maxCount = Math.max(...dayCounts)
  if (maxCount === 0) {
    return NextResponse.json({ bestDay: null })
  }

  const bestDayIndex = dayCounts.indexOf(maxCount)

  return NextResponse.json({
    bestDay: DAY_NAMES[bestDayIndex],
    avgLeads: Math.round((maxCount / 13) * 10) / 10, // rough avg over ~13 weeks
  })
}
