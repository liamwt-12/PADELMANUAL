import type { Metadata } from 'next'
import { getSupabase } from '@/lib/supabase'
import type { Listing } from '@/lib/types'

const now = new Date()
const monthYear = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

export const metadata: Metadata = {
  title: `UK Padel Venue Openings & Closures ${monthYear} | Padel Manual`,
  description: 'Track new padel venue openings and permanent closures across the UK. Updated monthly.',
}

function VenueCard({ listing, dateLabel }: { listing: Listing; dateLabel: string }) {
  return (
    <a
      href={`/${listing.slug}`}
      className="flex items-center justify-between rounded-xl border border-pm-border/40 bg-white px-5 py-4 transition-all hover:border-pm-accent/30"
    >
      <div>
        <p className="text-sm font-medium text-pm-text">{listing.name}</p>
        <p className="text-xs text-pm-faint mt-0.5">
          {listing.city || listing.region || 'UK'}
        </p>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p className="text-xs text-pm-faint">{dateLabel}</p>
        <span className="text-[#c4956a] text-xs">→</span>
      </div>
    </a>
  )
}

export default async function OpeningsClosuresPage() {
  const supabase = getSupabase()
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch new openings (created in last 90 days)
  const { data: newVenues } = await supabase
    .from('listings')
    .select('id, name, slug, city, region, created_at')
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .gte('created_at', ninetyDaysAgo)
    .order('created_at', { ascending: false })

  // Fetch recent closures (closed in last 90 days)
  const { data: closedVenues } = await supabase
    .from('listings')
    .select('id, name, slug, city, region, closed_at')
    .eq('listing_type', 'venue')
    .eq('permanently_closed', true)
    .not('closed_at', 'is', null)
    .gte('closed_at', ninetyDaysAgo)
    .order('closed_at', { ascending: false })

  // Stats
  const { count: totalVenues } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('listing_type', 'venue')
    .neq('permanently_closed', true)

  const { data: cityData } = await supabase
    .from('listings')
    .select('city')
    .eq('listing_type', 'venue')
    .neq('permanently_closed', true)
    .not('city', 'is', null)

  const cities = new Set((cityData || []).map(l => l.city).filter(Boolean))

  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString()
  const { count: newThisYear } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('listing_type', 'venue')
    .gte('created_at', startOfYear)

  const updatedDate = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="pb-16">
      <section className="pt-8 pb-6">
        <a href="/padel-news" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
          ← Padel News
        </a>
        <h1 className="mt-5 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-pm-text">
          UK Padel: Venue Openings &amp; Closures
        </h1>
        <p className="mt-3 text-base text-pm-muted leading-relaxed max-w-2xl">
          Updated {updatedDate}. Tracking {totalVenues?.toLocaleString() || '—'} venues across the UK.
        </p>
      </section>

      {/* New this month */}
      {(newVenues?.length ?? 0) > 0 && (
        <section className="mt-8">
          <div className="border-t border-pm-border" />
          <p className="label-caps mt-8 mb-6">New This Quarter</p>
          <div className="space-y-2">
            {(newVenues as Listing[]).map(v => (
              <VenueCard
                key={v.id}
                listing={v}
                dateLabel={new Date(v.created_at!).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              />
            ))}
          </div>
        </section>
      )}

      {(newVenues?.length ?? 0) === 0 && (
        <section className="mt-8">
          <div className="border-t border-pm-border" />
          <p className="label-caps mt-8 mb-6">New This Quarter</p>
          <p className="text-sm text-pm-muted">No new venue openings in the last 90 days.</p>
        </section>
      )}

      {/* Recently closed */}
      {(closedVenues?.length ?? 0) > 0 && (
        <section className="mt-8">
          <div className="border-t border-pm-border" />
          <p className="label-caps mt-8 mb-6">Recently Closed</p>
          <div className="space-y-2">
            {(closedVenues as Listing[]).map(v => (
              <VenueCard
                key={v.id}
                listing={v}
                dateLabel={v.closed_at ? new Date(v.closed_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                }) : ''}
              />
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="mt-12">
        <div className="border-t border-pm-border" />
        <p className="label-caps mt-8 mb-6">Padel in Numbers</p>
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <div>
            <p className="font-serif text-4xl tracking-tight text-pm-text">
              {totalVenues?.toLocaleString() || '—'}
            </p>
            <p className="text-xs text-pm-faint mt-1">Venues tracked</p>
          </div>
          <div>
            <p className="font-serif text-4xl tracking-tight text-pm-text">
              {cities.size}
            </p>
            <p className="text-xs text-pm-faint mt-1">Cities</p>
          </div>
          <div>
            <p className="font-serif text-4xl tracking-tight text-pm-text">
              {newThisYear || 0}
            </p>
            <p className="text-xs text-pm-faint mt-1">New this year</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 rounded-2xl border border-pm-border bg-white p-8">
        <h2 className="font-serif text-xl tracking-tight text-pm-text">
          Know a venue we&apos;re missing?
        </h2>
        <p className="text-sm text-pm-muted mt-2 leading-relaxed max-w-lg">
          We track every padel venue in the UK. If you know of a new opening or a venue we haven&apos;t listed,
          let us know.
        </p>
        <a
          href="/venues/add"
          className="inline-block mt-5 rounded-full bg-[#c4956a] text-white px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
        >
          Submit a venue →
        </a>
      </section>
    </main>
  )
}
