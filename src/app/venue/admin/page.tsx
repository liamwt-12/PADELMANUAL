import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import AdminDashboard from './AdminDashboard'

export const metadata: Metadata = {
  title: 'Admin',
}

export default async function AdminPage() {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get('admin_secret')?.value

  if (adminCookie !== process.env.ADMIN_SECRET) {
    redirect('/venue/admin/login')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Fetch venue owners with listing names
  const { data: owners } = await supabase
    .from('venue_owners')
    .select('id, email, name, subscription_status, listing_id, created_at')
    .order('created_at', { ascending: false })

  // Get listing names for owners
  const listingIds = (owners || []).map(o => o.listing_id).filter(Boolean)
  const { data: listings } = listingIds.length > 0
    ? await supabase.from('listings').select('id, name').in('id', listingIds)
    : { data: [] }

  const listingMap: Record<string, string> = {}
  for (const l of listings || []) {
    listingMap[l.id] = l.name
  }

  // Fetch recent outreach log
  const { data: outreachLog } = await supabase
    .from('outreach_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  // Fetch listing reports
  const { data: reports } = await supabase
    .from('listing_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Get listing names for reports
  const reportListingIds = (reports || []).map(r => r.listing_id).filter(Boolean)
  const { data: reportListings } = reportListingIds.length > 0
    ? await supabase.from('listings').select('id, name, slug').in('id', reportListingIds)
    : { data: [] }

  const reportListingMap: Record<string, { name: string; slug: string }> = {}
  for (const l of reportListings || []) {
    reportListingMap[l.id] = { name: l.name, slug: l.slug }
  }

  // Fetch pending venue submissions
  const { data: submissions } = await supabase
    .from('venue_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  // Sequence stats
  const { count: totalInSequence } = await supabase
    .from('outreach_log')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'outreach')
    .eq('status', 'sent')
    .eq('sequence_completed', false)
    .eq('claimed', false)

  const { count: awaitingStep2 } = await supabase
    .from('outreach_log')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'outreach')
    .eq('status', 'sent')
    .eq('sequence_step', 1)
    .eq('sequence_completed', false)
    .eq('claimed', false)

  const { count: awaitingStep3 } = await supabase
    .from('outreach_log')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'outreach')
    .eq('status', 'sent')
    .eq('sequence_step', 2)
    .eq('sequence_completed', false)
    .eq('claimed', false)

  const { count: awaitingStep4 } = await supabase
    .from('outreach_log')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'outreach')
    .eq('status', 'sent')
    .eq('sequence_step', 3)
    .eq('sequence_completed', false)
    .eq('claimed', false)

  const { count: sequenceComplete } = await supabase
    .from('outreach_log')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'outreach')
    .eq('sequence_completed', true)
    .eq('claimed', false)

  const { count: claimedDuringSequence } = await supabase
    .from('outreach_log')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'outreach')
    .eq('claimed', true)

  const { count: optedOutCount } = await supabase
    .from('outreach_optouts')
    .select('id', { count: 'exact', head: true })

  // Content coverage stats
  const { count: totalVenues } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
  const { count: withDescription } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('description', 'is', null)

  // Email coverage stats
  const { count: totalListings } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
  const { count: withEmail } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .not('email', 'is', null)

  return (
    <main className="py-8 pb-20">
      <AdminDashboard
        owners={(owners || []).map(o => ({
          ...o,
          listing_name: o.listing_id ? listingMap[o.listing_id] || null : null,
        }))}
        outreachLog={outreachLog || []}
        submissions={submissions || []}
        reports={(reports || []).map(r => ({
          ...r,
          listing_name: r.listing_id ? reportListingMap[r.listing_id]?.name || null : null,
          listing_slug: r.listing_id ? reportListingMap[r.listing_id]?.slug || null : null,
        }))}
        sequenceStats={{
          totalInSequence: totalInSequence || 0,
          awaitingStep2: awaitingStep2 || 0,
          awaitingStep3: awaitingStep3 || 0,
          awaitingStep4: awaitingStep4 || 0,
          sequenceComplete: sequenceComplete || 0,
          claimed: claimedDuringSequence || 0,
          optedOut: optedOutCount || 0,
        }}
        contentStats={{ total: totalVenues || 0, withDescription: withDescription || 0 }}
        emailStats={{ total: totalListings || 0, withEmail: withEmail || 0 }}
      />
    </main>
  )
}
