import { getSupabase } from '@/lib/supabase'
import type { Metadata } from 'next'
import UnavailableNotice from '../UnavailableNotice'

export const revalidate = 3600

const TOP_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Bristol', 'Leeds',
  'Edinburgh', 'Glasgow', 'Brighton', 'Nottingham', 'Liverpool',
]

type Props = { params: Promise<{ city: string }> }

function slugToCity(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function generateStaticParams() {
  return TOP_CITIES.map(city => ({
    city: city.toLowerCase().replace(/\s+/g, '-'),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params
  const cityName = slugToCity(slug)

  return {
    title: `Padel Courts in ${cityName} — Book Direct`,
    description: `Padel venues in ${cityName} with direct booking links. Live availability on Padel Manual is currently paused.`,
  }
}

export default async function PlayTodayCityPage({ params }: Props) {
  const { city: slug } = await params
  const cityName = slugToCity(slug)

  const supabase = getSupabase()

  // Get venues with Playtomic in this city
  const { data: playtomicVenues } = await supabase
    .from('listings')
    .select('id, name, slug, courts, indoor, playtomic_tenant_id, playtomic_url')
    .eq('city', cityName)
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('playtomic_tenant_id', 'is', null)
    .order('view_count', { ascending: false, nullsFirst: false })

  // Total venue count
  const { count: totalVenues } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('city', cityName)
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')

  const liveCount = playtomicVenues?.length || 0

  return (
    <main className="pb-10">
      <article className="max-w-2xl">
        <section className="pb-8 pt-6">
          <a href="/play-today" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
            ← Play Today
          </a>
          <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Padel Courts in {cityName}
          </h1>
          <p className="mt-4 text-base text-pm-muted leading-relaxed">
            {totalVenues || 0} padel venues in {cityName}, {liveCount} of which take bookings
            through Playtomic.
          </p>
        </section>

        <UnavailableNotice cityName={cityName} />

        <div className="prose-pm space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Booking a court in {cityName}
            </h2>
            <p>
              Padel Manual used to read live court availability directly from Playtomic. That data
              is no longer available to us, so we have switched the feature off rather than show you
              slot times we cannot stand behind.
            </p>
            <p>
              Each venue below links to its own booking page, where the availability is real and
              current. Most {cityName} clubs take bookings through Playtomic.
            </p>
          </section>

          {/* Venues with live availability */}
          {liveCount > 0 && (
            <section>
              <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
                {cityName} venues that book through Playtomic
              </h2>
              <p className="mb-4">
                These {liveCount} venues take online bookings — check availability on their own
                booking page:
              </p>
              <div className="grid gap-2">
                {(playtomicVenues || []).map(v => (
                  <a key={v.id} href={`/${v.slug}`} className="flex items-center justify-between rounded-xl border border-pm-border/40 px-4 py-3 hover:border-pm-accent/40 transition-all">
                    <div>
                      <span className="text-sm font-medium text-pm-text">{v.name}</span>
                      <span className="text-xs text-pm-faint ml-2">
                        {v.indoor === true ? 'Indoor' : v.indoor === false ? 'Outdoor' : ''}
                        {v.courts ? ` · ${v.courts} courts` : ''}
                      </span>
                    </div>
                    <span className="text-[10px] text-pm-faint shrink-0">Playtomic</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Tips for booking courts in {cityName}
            </h2>
            <p>
              <strong className="text-pm-text">Peak times fill fast.</strong> Weekday evenings (6–9pm) and weekend mornings are the busiest slots. If you can play off-peak — weekday mornings or early afternoons — you&apos;ll find more availability and lower prices.
            </p>
            <p>
              <strong className="text-pm-text">Book same-day.</strong> Courts that appear full in the evening often have cancellations. Check the venue&apos;s own booking page throughout the day — slots open up as players change plans.
            </p>
            <p>
              <strong className="text-pm-text">Try different venues.</strong> {cityName} has {totalVenues || 'multiple'} padel venues. If your usual spot is full, there&apos;s likely an available court at a venue ten minutes further away.
            </p>
          </section>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/find" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find a court</div>
            <p className="mt-1 text-xs text-pm-faint">Browse venues across the UK</p>
          </a>
          <a href={`/padel/${slug}`} className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">All {cityName} venues</div>
            <p className="mt-1 text-xs text-pm-faint">{totalVenues || 0} venues listed</p>
          </a>
        </div>
      </article>
    </main>
  )
}
