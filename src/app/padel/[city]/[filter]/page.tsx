import { getSupabase } from '@/lib/supabase'
import type { Metadata } from 'next'

export const revalidate = 3600

const TOP_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Bristol', 'Leeds',
  'Edinburgh', 'Glasgow', 'Brighton', 'Nottingham', 'Liverpool',
]

const FILTERS = ['indoor', 'outdoor'] as const
type Filter = typeof FILTERS[number]

function slugToCity(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

type Props = { params: Promise<{ city: string; filter: string }> }

export function generateStaticParams() {
  const params: { city: string; filter: string }[] = []
  for (const city of TOP_CITIES) {
    for (const filter of FILTERS) {
      params.push({
        city: city.toLowerCase().replace(/\s+/g, '-'),
        filter,
      })
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, filter } = await params
  const cityName = slugToCity(citySlug)
  const filterLabel = filter === 'indoor' ? 'Indoor' : filter === 'outdoor' ? 'Outdoor' : ''

  if (!filterLabel) return {}

  const supabase = getSupabase()
  const query = supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('city', cityName)
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')

  if (filter === 'indoor') query.eq('indoor', true)
  if (filter === 'outdoor') query.eq('indoor', false)

  const { count } = await query
  const venueCount = count || 0

  return {
    title: `${filterLabel} Padel Courts in ${cityName} (${venueCount} Venues)`,
    description: `Find ${filterLabel.toLowerCase()} padel courts in ${cityName}. ${venueCount} venues listed with prices, availability and booking links.`,
  }
}

export default async function FilterPage({ params }: Props) {
  const { city: citySlug, filter } = await params
  const cityName = slugToCity(citySlug)

  if (!FILTERS.includes(filter as Filter)) return null

  const filterLabel = filter === 'indoor' ? 'Indoor' : 'Outdoor'
  const isIndoor = filter === 'indoor'

  const supabase = getSupabase()
  const { data: venues } = await supabase
    .from('listings')
    .select('id, name, slug, courts, indoor, postcode, address, booking_platform, playtomic_tenant_id, premium, view_count, description')
    .eq('city', cityName)
    .eq('listing_type', 'venue')
    .eq('indoor', isIndoor)
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .order('name')

  if (!venues) return null

  const sorted = [...venues].sort((a, b) => {
    if (a.premium && !b.premium) return -1
    if (!a.premium && b.premium) return 1
    return (b.view_count || 0) - (a.view_count || 0)
  })

  const courtCount = venues.reduce((sum, v) => sum + (v.courts || 0), 0)

  return (
    <main className="pb-10">
      <section className="pt-6 pb-10">
        <a href={`/padel/${citySlug}`} className="text-xs text-pm-faint hover:text-pm-text transition-colors">
          ← All {cityName} venues
        </a>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Padel Courts in {cityName}
        </h1>
        <p className="mt-2 text-base text-pm-muted">
          {filterLabel} venues only · {venues.length} venue{venues.length !== 1 ? 's' : ''}
          {courtCount > 0 && ` · ${courtCount} courts`}
        </p>
      </section>

      {/* Filter toggle */}
      <div className="flex gap-2 mb-8">
        <a
          href={`/padel/${citySlug}/indoor`}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            filter === 'indoor'
              ? 'bg-pm-text text-white'
              : 'border border-pm-border text-pm-muted hover:border-pm-accent/40'
          }`}
        >
          Indoor
        </a>
        <a
          href={`/padel/${citySlug}/outdoor`}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            filter === 'outdoor'
              ? 'bg-pm-text text-white'
              : 'border border-pm-border text-pm-muted hover:border-pm-accent/40'
          }`}
        >
          Outdoor
        </a>
        <a
          href={`/padel/${citySlug}`}
          className="rounded-full border border-pm-border px-4 py-2 text-sm text-pm-muted hover:border-pm-accent/40 transition-all"
        >
          All venues
        </a>
      </div>

      {/* Venue grid */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-pm-border/30 bg-pm-bg-card p-8 text-center">
          <p className="text-sm text-pm-muted">
            No {filterLabel.toLowerCase()} padel courts found in {cityName}.
          </p>
          <a href={`/padel/${citySlug}`} className="mt-3 inline-block text-sm text-pm-accent hover:text-pm-text transition-colors">
            View all {cityName} venues →
          </a>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sorted.map(v => (
            <a key={v.id} href={`/${v.slug}`} className="card block">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
                  {filterLabel}
                  {v.courts ? ` · ${v.courts} courts` : ''}
                </span>
                <div className="flex items-center gap-2">
                  {v.playtomic_tenant_id && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live
                    </span>
                  )}
                  {v.premium && (
                    <span className="text-[10px] font-semibold text-pm-accent">Premium</span>
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
      )}

      {/* SEO footer */}
      <section className="mt-14 pt-8 border-t border-pm-border/30">
        <p className="text-xs leading-relaxed text-pm-faint max-w-2xl">
          Padel Manual lists every {filterLabel.toLowerCase()} padel venue in {cityName}. All listings include court counts, booking links, and live availability where supported. Looking for {filter === 'indoor' ? 'outdoor' : 'indoor'} courts? <a href={`/padel/${citySlug}/${filter === 'indoor' ? 'outdoor' : 'indoor'}`} className="text-pm-accent hover:underline">View {filter === 'indoor' ? 'outdoor' : 'indoor'} venues in {cityName}</a>.
        </p>
      </section>
    </main>
  )
}
