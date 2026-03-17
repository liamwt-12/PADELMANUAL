import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const email = request.cookies.get('pm_impersonate')?.value
  if (!email) {
    return NextResponse.json({ error: 'Not impersonating' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  // Fetch all venue_owner rows for the impersonated email
  const { data: ownerRows } = await supabase
    .from('venue_owners')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: true })

  if (!ownerRows || ownerRows.length === 0) {
    return NextResponse.json({ owners: [], listings: [], allListings: [] })
  }

  // Fetch listing summaries
  const listingIds = ownerRows.map(o => o.listing_id).filter(Boolean)
  const { data: listingSummaries } = await supabase
    .from('listings')
    .select('id, name, city, slug, view_count, click_count')
    .in('id', listingIds)

  // Fetch full listing — use listing_id param if provided, else first owner's
  const requestedListingId = request.nextUrl.searchParams.get('listing_id')
  const targetListingId = requestedListingId || ownerRows[0]?.listing_id
  let activeListing = null
  if (targetListingId) {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('id', targetListingId)
      .single()
    activeListing = data
  }

  return NextResponse.json({
    owners: ownerRows,
    listingSummaries: listingSummaries || [],
    activeListing,
  })
}
