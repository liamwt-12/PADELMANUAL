import { UK_STATIONS, UK_REGIONS } from '@/lib/uk-stations'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Padel Courts Near Any UK Train Station',
  description: 'Search for padel courts near every major UK train station. Find venues, compare facilities and book courts near your station.',
}

export default function StationIndexPage() {
  const byRegion: Record<string, typeof UK_STATIONS> = {}
  for (const s of UK_STATIONS) {
    if (!byRegion[s.region]) byRegion[s.region] = []
    byRegion[s.region].push(s)
  }

  return (
    <main className="pb-10">
      <section className="pt-6 pb-10">
        <a href="/padel" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
          ← All cities
        </a>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Padel Courts by Station
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-pm-muted">
          Find padel courts near any major UK train station. {UK_STATIONS.length} stations covered across {UK_REGIONS.length} regions.
        </p>
      </section>

      {/* Region jump links */}
      <div className="flex flex-wrap gap-2 mb-10">
        {UK_REGIONS.map(region => (
          <a
            key={region}
            href={`#${region.toLowerCase().replace(/\s+/g, '-')}`}
            className="rounded-full border border-pm-border px-4 py-2 text-sm text-pm-muted hover:border-pm-accent/40 hover:text-pm-text transition-all"
          >
            {region}
          </a>
        ))}
      </div>

      {/* Stations by region */}
      {UK_REGIONS.map(region => {
        const stations = byRegion[region]
        if (!stations || stations.length === 0) return null
        return (
          <section key={region} id={region.toLowerCase().replace(/\s+/g, '-')} className="mb-12">
            <div className="label-caps">{region}</div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {stations.map(s => (
                <a
                  key={s.slug}
                  href={`/padel/station/${s.slug}`}
                  className="rounded-xl border border-pm-border/40 bg-white px-4 py-3 hover:border-pm-accent/40 hover:bg-pm-bg-hover transition-all"
                >
                  <div className="font-semibold text-sm text-pm-text truncate">{s.name}</div>
                  <div className="text-xs text-pm-faint mt-0.5">{s.city}</div>
                </a>
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}
