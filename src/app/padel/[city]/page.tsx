import { getSupabase } from '@/lib/supabase'
import type { Metadata } from 'next'
import NewsletterSignup from '@/components/NewsletterSignup'

export const revalidate = 3600

type Props = { params: Promise<{ city: string }> }

function slugToCity(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export async function generateStaticParams() {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('listings')
    .select('city')
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('city', 'is', null)

  const counts: Record<string, number> = {}
  for (const row of data || []) {
    if (row.city) counts[row.city] = (counts[row.city] || 0) + 1
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([city]) => ({ city: city.toLowerCase().replace(/\s+/g, '-') }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params
  const cityName = slugToCity(slug)

  const supabase = getSupabase()
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('city', cityName)
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')

  const venueCount = count || 0

  return {
    title: `Padel Courts in ${cityName} (${venueCount} Venues)`,
    description: `Find padel courts in ${cityName}. ${venueCount} venues listed with prices, availability and booking links.`,
  }
}

// City editorial intros
const cityIntros: Record<string, string> = {
  London: "London has more padel courts per capita than any other UK city, with new venues opening monthly across South West and East London. The capital offers everything from pay-and-play at council-run facilities to premium membership clubs with resident coaches.",
  Manchester: "Manchester's padel scene has exploded. From Carbon Padel Club's 17-court facility to clubs in Didsbury and Trafford, the city rivals London for court density. New venues are opening regularly as demand continues to outpace supply.",
  Bristol: "Bristol punches above its weight in padel. Rocket Padel's arrival supercharged the scene, and local clubs are expanding fast. The mix of indoor and outdoor courts means year-round play, regardless of the West Country weather.",
  Birmingham: "The Midlands padel hub. Birmingham's central location and growing club scene make it a natural destination for players across the region. New venues are opening regularly as demand builds.",
  Leeds: "Yorkshire's padel capital. Leeds has seen rapid growth with new venues catering to beginners and competitive players alike. Courts fill up fast at peak times — book ahead.",
  Edinburgh: "Scotland's padel pioneer. Edinburgh was among the first Scottish cities to embrace the sport, with indoor courts meaning year-round play regardless of the weather.",
  Glasgow: "Glasgow's padel community is tight-knit and growing. Multiple venues now offer courts across the city, with new facilities planned. The competitive scene is heating up with regular tournaments.",
  Newcastle: "The North East's padel hub. Newcastle venues range from dedicated padel centres to multi-sport facilities adding courts to meet demand. A strong social scene makes it easy to find playing partners.",
  Liverpool: "Liverpool's padel scene is young but vibrant. New venues are opening to serve the city's enthusiastic sporting community, with more planned for 2026.",
  Sheffield: "Steel City is forging a padel identity. Sheffield's mix of indoor and outdoor courts caters to all levels, with good accessibility from the Peak District corridor.",
  Cardiff: "Wales' padel capital. Cardiff leads the way for Welsh padel with multiple venues and a growing coaching community.",
  Nottingham: "Nottingham's padel offering has grown significantly, with venues across the city and surrounding areas. The university influence brings a young, enthusiastic player base.",
  Southampton: "South coast padel at its best. Southampton's venues benefit from milder weather for outdoor play, and the city's sporting infrastructure continues to expand.",
  Brighton: "Brighton's padel scene fits the city — social, energetic, and growing fast. Coastal courts and a community that loves trying new sports make it one to watch.",
}

export default async function PadelCityPage({ params }: Props) {
  const { city: slug } = await params
  const cityName = slugToCity(slug)
  const supabase = getSupabase()

  // Fetch all venues in city
  const { data: venues } = await supabase
    .from('listings')
    .select('id, name, slug, lat, lng, courts, indoor, postcode, address, listing_type, booking_platform, playtomic_url, playtomic_tenant_id, claimed, premium, view_count, description, price_per_hour_peak, price_per_hour_offpeak, created_at')
    .eq('city', cityName)
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .order('name')

  if (!venues || venues.length === 0) {
    return null
  }

  // Sort: premium first, then by view_count
  const sorted = [...venues].sort((a, b) => {
    if (a.premium && !b.premium) return -1
    if (!a.premium && b.premium) return 1
    return (b.view_count || 0) - (a.view_count || 0)
  })

  const courtCount = venues.reduce((sum, v) => sum + (v.courts || 0), 0)
  const indoorCount = venues.filter(v => v.indoor === true).length
  const outdoorCount = venues.filter(v => v.indoor === false).length
  const intro = cityIntros[cityName] || `Browse ${venues.length} padel venues in ${cityName}. Find courts, check availability, and book your next game.`

  // Average prices
  const peakPrices = venues.map(v => v.price_per_hour_peak).filter(Boolean) as number[]
  const offpeakPrices = venues.map(v => v.price_per_hour_offpeak).filter(Boolean) as number[]
  const avgPeak = peakPrices.length > 0 ? Math.round(peakPrices.reduce((a, b) => a + b, 0) / peakPrices.length) : null
  const avgOffpeak = offpeakPrices.length > 0 ? Math.round(offpeakPrices.reduce((a, b) => a + b, 0) / offpeakPrices.length) : null

  // New openings (last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const newVenues = venues.filter(v => v.created_at && v.created_at >= ninetyDaysAgo)

  return (
    <main className="pb-10">
      <section className="pt-6 pb-10">
        <a href="/padel" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
          ← All cities
        </a>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Padel Courts in {cityName}
        </h1>
        <p className="mt-2 text-base text-pm-muted">
          {venues.length} venue{venues.length !== 1 ? 's' : ''} across {cityName.toLowerCase() === 'london' ? 'the capital' : 'the city'}
        </p>
      </section>

      {/* About */}
      <section className="mb-10">
        <div className="label-caps">About padel in {cityName}</div>
        <p className="mt-3 max-w-2xl text-sm leading-[1.9] text-pm-muted">{intro}</p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <div className="rounded-xl border border-pm-border/40 bg-white px-4 py-3 text-center">
          <div className="font-serif text-lg font-bold text-pm-text">{venues.length}</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Venues</div>
        </div>
        {courtCount > 0 && (
          <div className="rounded-xl border border-pm-border/40 bg-white px-4 py-3 text-center">
            <div className="font-serif text-lg font-bold text-pm-text">{courtCount}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Courts</div>
          </div>
        )}
        {indoorCount > 0 && (
          <a href={`/padel/${slug}/indoor`} className="rounded-xl border border-pm-border/40 bg-white px-4 py-3 text-center hover:border-pm-accent/40 transition-all">
            <div className="font-serif text-lg font-bold text-pm-text">{indoorCount}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Indoor →</div>
          </a>
        )}
        {outdoorCount > 0 && (
          <a href={`/padel/${slug}/outdoor`} className="rounded-xl border border-pm-border/40 bg-white px-4 py-3 text-center hover:border-pm-accent/40 transition-all">
            <div className="font-serif text-lg font-bold text-pm-text">{outdoorCount}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Outdoor →</div>
          </a>
        )}
      </div>

      {/* Average prices */}
      {(avgPeak || avgOffpeak) && (
        <section className="mb-10">
          <div className="label-caps">Average court price</div>
          <p className="mt-3 text-sm text-pm-muted">
            {avgPeak && <span>£{avgPeak}/hr peak</span>}
            {avgPeak && avgOffpeak && <span> · </span>}
            {avgOffpeak && <span>£{avgOffpeak}/hr off-peak</span>}
          </p>
        </section>
      )}

      {/* Venues */}
      <section className="mb-10">
        <div className="label-caps">Venues</div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {sorted.map(v => (
            <a key={v.id} href={`/${v.slug}`} className="card block">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
                  {v.indoor === true ? 'Indoor' : v.indoor === false ? 'Outdoor' : ''}
                  {v.courts ? `${v.indoor !== null ? ' · ' : ''}${v.courts} courts` : ''}
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
      </section>

      {/* New openings */}
      {newVenues.length > 0 && (
        <section className="mb-10">
          <div className="label-caps">New openings</div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {newVenues.map(v => (
              <a key={v.id} href={`/${v.slug}`} className="card block">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
                    {v.indoor === true ? 'Indoor' : v.indoor === false ? 'Outdoor' : ''}
                    {v.courts ? `${v.indoor !== null ? ' · ' : ''}${v.courts} courts` : ''}
                  </span>
                  <span className="text-[10px] text-pm-faint">
                    Added {new Date(v.created_at!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{v.name}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Map CTA */}
      <section className="mb-10 text-center">
        <a
          href={`/find?city=${encodeURIComponent(cityName)}`}
          className="btn-primary inline-block"
        >
          View {cityName} on the map →
        </a>
      </section>

      {/* Newsletter */}
      <section className="mb-10">
        <NewsletterSignup />
      </section>

      {/* Claim CTA */}
      <section className="rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-8">
        <h3 className="font-serif text-xl font-semibold tracking-tight">
          Run a padel venue in {cityName}?
        </h3>
        <p className="mt-2 text-sm text-pm-muted max-w-md leading-relaxed">
          Your listing is already here. Claim it for free to update your details,
          add photos, and appear higher in search.
        </p>
        <a
          href={`/find?city=${encodeURIComponent(cityName)}`}
          className="mt-4 btn-secondary inline-block text-sm"
        >
          Find your listing →
        </a>
      </section>

      {/* SEO footer */}
      <section className="mt-14 pt-8 border-t border-pm-border/30">
        <p className="text-xs leading-relaxed text-pm-faint max-w-2xl">
          Padel Manual lists every padel venue in {cityName}, with live court availability, prices, and direct booking links. Whether you&apos;re looking for indoor or outdoor courts, coaching, or simply the nearest place to play, this page is kept up to date so you can find a court and get on it.
        </p>
      </section>
    </main>
  )
}
