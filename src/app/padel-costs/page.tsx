import type { Metadata } from 'next'
import { getSupabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'How Much Does Padel Cost in the UK? 2026 Price Guide | Padel Manual',
  description: 'Average padel court hire prices across UK cities. Updated with real pricing data from venues nationwide.',
}

export const revalidate = 86400 // daily

type CityPricing = {
  city: string
  avgPeak: number | null
  avgOffpeak: number | null
  venues: number
}

export default async function PadelCostsPage() {
  const supabase = getSupabase()

  const { data: venuesWithPricing } = await supabase
    .from('listings')
    .select('city, price_per_hour_peak, price_per_hour_offpeak')
    .eq('listing_type', 'venue')
    .neq('permanently_closed', true)
    .not('city', 'is', null)

  // Build city averages
  const cityMap: Record<string, { peaks: number[]; offpeaks: number[]; count: number }> = {}

  for (const v of venuesWithPricing || []) {
    if (!v.city) continue
    if (!cityMap[v.city]) cityMap[v.city] = { peaks: [], offpeaks: [], count: 0 }
    cityMap[v.city].count++
    if (v.price_per_hour_peak != null) cityMap[v.city].peaks.push(Number(v.price_per_hour_peak))
    if (v.price_per_hour_offpeak != null) cityMap[v.city].offpeaks.push(Number(v.price_per_hour_offpeak))
  }

  const cityPricing: CityPricing[] = Object.entries(cityMap)
    .filter(([, data]) => data.peaks.length > 0 || data.offpeaks.length > 0)
    .map(([city, data]) => ({
      city,
      avgPeak: data.peaks.length > 0 ? Math.round(data.peaks.reduce((a, b) => a + b, 0) / data.peaks.length) : null,
      avgOffpeak: data.offpeaks.length > 0 ? Math.round(data.offpeaks.reduce((a, b) => a + b, 0) / data.offpeaks.length) : null,
      venues: data.count,
    }))
    .sort((a, b) => b.venues - a.venues)

  // Total venues with any price data
  const totalWithPricing = cityPricing.reduce((s, c) => s + c.venues, 0)

  // Total venues overall
  const { count: totalVenues } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('listing_type', 'venue')
    .neq('permanently_closed', true)

  const updatedDate = new Date().toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="pb-16">
      <section className="pt-8 pb-6">
        <div className="label-caps">Price Guide</div>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-pm-text">
          What Does Padel Cost?
        </h1>
        <p className="mt-3 text-base text-pm-muted leading-relaxed max-w-2xl">
          Average court hire prices across the UK{totalWithPricing > 0 ? `, based on ${totalWithPricing} venues` : ''}.
          Updated {updatedDate}.
        </p>
      </section>

      {cityPricing.length > 0 ? (
        <section className="mt-6">
          <div className="border-t border-pm-border" />
          <p className="label-caps mt-8 mb-6">Average Court Hire by City</p>

          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-4 px-4 pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint">
            <span>City</span>
            <span className="text-right">Peak</span>
            <span className="text-right">Off-Peak</span>
            <span className="text-right">Venues</span>
          </div>

          <div className="space-y-1">
            {cityPricing.map(c => (
              <a
                key={c.city}
                href={`/city/${encodeURIComponent(c.city.toLowerCase())}`}
                className="grid sm:grid-cols-4 gap-1 sm:gap-4 rounded-xl px-4 py-3 transition-all hover:bg-white group"
              >
                <span className="text-sm font-medium text-pm-text group-hover:text-[#c4956a] transition-colors">
                  {c.city}
                </span>
                <span className="text-sm text-pm-muted sm:text-right">
                  {c.avgPeak != null ? `£${c.avgPeak}/hr` : '—'}
                  <span className="sm:hidden text-pm-faint text-xs ml-1">peak</span>
                </span>
                <span className="text-sm text-pm-muted sm:text-right">
                  {c.avgOffpeak != null ? `£${c.avgOffpeak}/hr` : '—'}
                  <span className="sm:hidden text-pm-faint text-xs ml-1">off-peak</span>
                </span>
                <span className="text-sm text-pm-faint sm:text-right">
                  {c.venues}
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-6">
          <div className="border-t border-pm-border" />
          <p className="label-caps mt-8 mb-6">Pricing Data</p>
          <p className="text-sm text-pm-muted leading-relaxed max-w-lg">
            We&apos;re building our pricing database. As venue owners add their court hire rates,
            average prices by city will appear here automatically.
          </p>
        </section>
      )}

      {/* Existing guide link */}
      <section className="mt-12 rounded-2xl border border-pm-border bg-white p-8">
        <h2 className="font-serif text-xl tracking-tight text-pm-text">
          The full guide to padel costs
        </h2>
        <p className="text-sm text-pm-muted mt-2 leading-relaxed max-w-lg">
          Court hire is just one part of the picture. Read our complete guide covering equipment,
          coaching, memberships, and how to play on a budget.
        </p>
        <a
          href="/guides/padel-cost-uk"
          className="inline-block mt-5 text-sm text-[#c4956a] font-medium hover:underline"
        >
          Read the full cost guide →
        </a>
      </section>

      {/* CTA for venue owners */}
      {totalVenues && totalWithPricing < totalVenues && (
        <section className="mt-8 text-center">
          <p className="text-sm text-pm-muted">
            Own a venue?{' '}
            <a href="/venue/dashboard/listing" className="text-[#c4956a] hover:underline">
              Add your pricing in your dashboard
            </a>{' '}
            to appear in this table.
          </p>
        </section>
      )}
    </main>
  )
}
