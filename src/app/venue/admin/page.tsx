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
        emailStats={{ total: totalListings || 0, withEmail: withEmail || 0 }}
      />
    </main>
  )
}
