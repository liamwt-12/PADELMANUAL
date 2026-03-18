import { getSupabase } from '@/lib/supabase'
import { UK_STATIONS, UK_STATION_MAP } from '@/lib/uk-stations'
import { haversineDistance } from '@/lib/stations'
import type { Metadata } from 'next'

export const revalidate = 3600

type Props = { params: Promise<{ station: string }> }

export function generateStaticParams() {
  return UK_STATIONS.map(s => ({ station: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { station: slug } = await params
  const station = UK_STATION_MAP[slug]
  if (!station) return {}

  const supabase = getSupabase()
  const { data: venues } = await supabase
    .from('listings')
    .select('lat, lng')
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  const within5 = (venues || []).filter(v =>
    haversineDistance(station.lat, station.lng, v.lat!, v.lng!) <= 5
  ).length

  return {
    title: `Padel Courts near ${station.name} Station`,
    description: `Find padel courts near ${station.name}. ${within5} venue${within5 !== 1 ? 's' : ''} within 5 miles. View facilities, get directions and book courts.`,
  }
}

export default async function UKStationPage({ params }: Props) {
  const { station: slug } = await params
  const station = UK_STATION_MAP[slug]
  if (!station) return null

  const supabase = getSupabase()
  const { data: allVenues } = await supabase
    .from('listings')
    .select('id, name, slug, lat, lng, courts, indoor, postcode, address, booking_platform, playtomic_tenant_id, premium, view_count, description')
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  if (!allVenues) return null

  const withDistance = allVenues.map(v => ({
    ...v,
    distance: haversineDistance(station.lat, station.lng, v.lat!, v.lng!),
  })).sort((a, b) => a.distance - b.distance)

  const within5 = withDistance.filter(v => v.distance <= 5)
  const hasVenuesNearby = within5.length > 0
  const displayVenues = hasVenuesNearby ? within5 : withDistance.slice(0, 3)
  const nearest = withDistance[0]

  const citySlug = station.city.toLowerCase().replace(/\s+/g, '-')

  return (
    <main className="pb-10">
      <section className="pt-6 pb-10">
        <a href={`/padel/${citySlug}`} className="text-xs text-pm-faint hover:text-pm-text transition-colors">
          ← Padel in {station.city}
        </a>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Padel Courts near {station.name}
        </h1>
        {hasVenuesNearby ? (
          <p className="mt-2 text-base text-pm-muted">
            {within5.length} venue{within5.length !== 1 ? 's' : ''} within 5 miles
          </p>
        ) : (
          <div className="mt-4 rounded-2xl border border-pm-border/30 bg-pm-bg-card p-6">
            <p className="text-sm text-pm-muted">
              No padel courts within 5 miles of {station.name}.
              {nearest && (
                <> The nearest venue is <a href={`/${nearest.slug}`} className="text-pm-accent hover:underline">{nearest.name}</a>, {nearest.distance.toFixed(1)} miles away.</>
              )}
            </p>
          </div>
        )}
      </section>

      {/* Venue cards */}
      <section className="mb-10">
        <div className="grid gap-3 md:grid-cols-2">
          {displayVenues.map(v => (
            <a key={v.id} href={`/${v.slug}`} className="card block">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
                  {v.indoor === true ? 'Indoor' : v.indoor === false ? 'Outdoor' : ''}
                  {v.courts ? `${v.indoor !== null ? ' · ' : ''}${v.courts} courts` : ''}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-pm-faint">{v.distance.toFixed(1)} miles</span>
                  {v.playtomic_tenant_id && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{v.name}</div>
              {v.description && (
                <p className="mt-2 text-[13px] leading-relaxed text-pm-muted line-clamp-2">{v.description}</p>
              )}
              {!v.description && v.address && (
                <p className="mt-1 text-[13px] text-pm-muted truncate">{v.address}</p>
              )}
              {v.postcode && (
                <p className="mt-1 text-xs text-pm-faint">{v.postcode}</p>
              )}
            </a>
          ))}
        </div>
      </section>

      {/* More in city */}
      <section className="mb-10">
        <div className="label-caps">More in {station.city}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={`/padel/${citySlug}`}
            className="rounded-full border border-pm-border px-4 py-2 text-sm text-pm-muted hover:border-pm-accent/40 hover:text-pm-text transition-all"
          >
            All padel courts in {station.city}
          </a>
          <a
            href={`/padel/${citySlug}/indoor`}
            className="rounded-full border border-pm-border px-4 py-2 text-sm text-pm-muted hover:border-pm-accent/40 hover:text-pm-text transition-all"
          >
            Indoor padel in {station.city}
          </a>
        </div>
      </section>

      {/* All stations link */}
      <section className="pt-8 border-t border-pm-border/30">
        <a href="/padel/station" className="text-sm text-pm-accent hover:text-pm-text transition-colors">
          ← All UK train stations
        </a>
      </section>

      {/* SEO footer */}
      <section className="mt-8">
        <p className="text-xs leading-relaxed text-pm-faint max-w-2xl">
          Padel Manual lists every padel venue near {station.name} station in {station.city}. Distances are calculated from the station. All venues shown include court counts, indoor/outdoor availability, and direct booking links where available.
        </p>
      </section>
    </main>
  )
}
