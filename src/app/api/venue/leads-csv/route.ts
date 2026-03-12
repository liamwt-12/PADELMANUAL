import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
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

  // Get owner + listing
  const { data: owner } = await supabase
    .from('venue_owners')
    .select('listing_id, subscription_status, trial_ends_at')
    .eq('email', user.email)
    .single()

  if (!owner?.listing_id) {
    return NextResponse.json({ error: 'No listing found' }, { status: 404 })
  }

  const isPremium = owner.subscription_status === 'premium'
  const isTrial = owner.subscription_status === 'trial' &&
    owner.trial_ends_at && new Date(owner.trial_ends_at) > new Date()

  if (!isPremium && !isTrial) {
    return NextResponse.json({ error: 'Premium required' }, { status: 403 })
  }

  // Get listing slug for filename
  const { data: listing } = await supabase
    .from('listings')
    .select('slug')
    .eq('id', owner.listing_id)
    .single()

  // Fetch all leads
  const { data: leads } = await supabase
    .from('listing_leads')
    .select('player_name, player_email, interest_type, player_message, created_at')
    .eq('listing_id', owner.listing_id)
    .order('created_at', { ascending: false })

  if (!leads || leads.length === 0) {
    return NextResponse.json({ error: 'No leads to export' }, { status: 404 })
  }

  // Build CSV
  const header = 'Name,Email,Interest,Message,Date'
  const rows = leads.map(l => {
    const name = escapeCsv(l.player_name || '')
    const email = escapeCsv(l.player_email || '')
    const interest = escapeCsv(l.interest_type || '')
    const message = escapeCsv(l.player_message || '')
    const date = new Date(l.created_at).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
    return `${name},${email},${interest},${message},${date}`
  })

  const csv = [header, ...rows].join('\n')
  const slug = listing?.slug || 'venue'
  const dateStr = new Date().toISOString().split('T')[0]

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${slug}-${dateStr}.csv"`,
    },
  })
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
