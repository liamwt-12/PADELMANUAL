import { getSupabase } from '@/lib/supabase'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Find Padel Courts Near You',
  description: 'Browse padel courts across the UK by city. Venues, prices, availability and booking links for every major city.',
}

export default async function PadelIndexPage() {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('listings')
    .select('city, courts')
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('city', 'is', null)

  const cityData: Record<string, { venues: number; courts: number }> = {}
  for (const row of data || []) {
    if (!row.city) continue
    if (!cityData[row.city]) cityData[row.city] = { venues: 0, courts: 0 }
    cityData[row.city].venues++
    cityData[row.city].courts += row.courts || 0
  }

  const cities = Object.entries(cityData)
    .sort((a, b) => b[1].venues - a[1].venues)

  return (
    <main className="pb-10">
      <section className="pt-6 pb-10">
        <a href="/find" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
          ← Find courts
        </a>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Padel courts by city
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-pm-muted">
          {cities.length} cities with padel venues across the UK. Browse by city to find courts, prices and booking links near you.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {cities.map(([city, stats]) => (
          <a
            key={city}
            href={`/padel/${encodeURIComponent(city.toLowerCase().replace(/\s+/g, '-'))}`}
            className="card block"
          >
            <div className="font-serif text-lg font-semibold tracking-tight">{city}</div>
            <p className="mt-1 text-xs text-pm-faint">
              {stats.venues} venue{stats.venues !== 1 ? 's' : ''}
              {stats.courts > 0 && ` · ${stats.courts} courts`}
            </p>
          </a>
        ))}
      </div>
    </main>
  )
}
