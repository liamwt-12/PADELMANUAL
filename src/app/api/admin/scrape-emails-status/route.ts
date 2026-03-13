import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const adminSecret = request.headers.get('x-admin-secret') || request.headers.get('authorization')?.replace('Bearer ', '')
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { count: totalVenues } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')

  const { count: withEmail } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('email', 'is', null)

  const { count: withWebsite } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('website_url', 'is', null)

  const { count: noEmailHasWebsite } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .is('email', null)
    .not('website_url', 'is', null)

  const { count: noEmailNoWebsite } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .is('email', null)
    .is('website_url', null)

  return NextResponse.json({
    total_venues: totalVenues || 0,
    with_email: withEmail || 0,
    without_email: (totalVenues || 0) - (withEmail || 0),
    with_website: withWebsite || 0,
    scrapeable: noEmailHasWebsite || 0,
    unreachable: noEmailNoWebsite || 0,
    coverage: totalVenues ? `${Math.round(((withEmail || 0) / totalVenues) * 100)}%` : '0%',
  })
}
