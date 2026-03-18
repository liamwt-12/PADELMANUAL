import { getSupabase } from '@/lib/supabase'
import { STATIONS, STATION_MAP, haversineDistance, nearbyStations } from '@/lib/stations'
import type { Metadata } from 'next'

export const revalidate = 3600

type Props = { params: Promise<{ station: string }> }

export function generateStaticParams() {
  return STATIONS.map(s => ({ station: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { station: slug } = await params
  const station = STATION_MAP[slug]
  if (!station) return {}

  const supabase = getSupabase()
  const { data: venues } = await supabase
    .from('listings')
    .select('lat, lng')
    .eq('listing_type', 'venue')
    .eq('city', 'London')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  const within3 = (venues || []).filter(v =>
    haversineDistance(station.lat, station.lng, v.lat!, v.lng!) <= 3
  ).length

  return {
    title: `Padel Courts near ${station.name}, London`,
    description: `Find padel courts near ${station.name}. ${within3} venue${within3 !== 1 ? 's' : ''} within 3 miles. Compare facilities, prices and book courts today.`,
  }
}

export default async function StationPage({ params }: Props) {
  const { station: slug } = await params
  const station = STATION_MAP[slug]
  if (!station) return null

  const supabase = getSupabase()
  const { data: allVenues } = await supabase
    .from('listings')
    .select('id, name, slug, lat, lng, courts, indoor, postcode, address, booking_platform, playtomic_tenant_id, playtomic_url, premium, view_count, description')
    .eq('listing_type', 'venue')
    .eq('city', 'London')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  if (!allVenues) return null

  // Calculate distance for each venue
  const withDistance = allVenues.map(v => ({
    ...v,
    distance: haversineDistance(station.lat, station.lng, v.lat!, v.lng!),
  })).sort((a, b) => a.distance - b.distance)

  const within3 = withDistance.filter(v => v.distance <= 3)
  const hasVenuesNearby = within3.length > 0
  const displayVenues = hasVenuesNearby ? within3 : withDistance.slice(0, 3)
  const nearest = withDistance[0]

  // Nearby stations for cross-linking
  const nearby = nearbyStations(slug, 3)

  return (
    <main className="pb-10">
      <section className="pt-6 pb-10">
        <a href="/padel/london" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
          ← All London venues
        </a>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Padel Courts near {station.name}
        </h1>
        {hasVenuesNearby ? (
          <p className="mt-2 text-base text-pm-muted">
            {within3.length} venue{within3.length !== 1 ? 's' : ''} within 3 miles
          </p>
        ) : (
          <div className="mt-4 rounded-2xl border border-pm-border/30 bg-pm-bg-card p-6">
            <p className="text-sm text-pm-muted">
              No padel courts within 3 miles of {station.name}.
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

      {/* Map CTA */}
      <section className="mb-10 text-center">
        <a
          href="/find?city=London"
          className="btn-primary inline-block"
        >
          View London on the map →
        </a>
      </section>

      {/* Also near here — nearby stations */}
      {nearby.length > 0 && (
        <section className="mb-10">
          <div className="label-caps">Also near here</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {nearby.map(s => (
              <a
                key={s.slug}
                href={`/padel/near/${s.slug}`}
                className="rounded-full border border-pm-border px-4 py-2 text-sm text-pm-muted hover:border-pm-accent/40 hover:text-pm-text transition-all"
              >
                {s.name}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Back to London */}
      <section className="mt-8 pt-8 border-t border-pm-border/30">
        <a href="/padel/london" className="text-sm text-pm-accent hover:text-pm-text transition-colors">
          ← All padel courts in London
        </a>
      </section>

      {/* SEO footer */}
      <section className="mt-8">
        <p className="text-xs leading-relaxed text-pm-faint max-w-2xl">
          Padel Manual lists every padel venue near {station.name} station in London. Distances are calculated from the station entrance. All venues shown include court counts, indoor/outdoor availability, and direct booking links where available.
        </p>
      </section>
    </main>
  )
}
