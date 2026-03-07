import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import type { Metadata } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// City editorial intros — add more as you go
const cityIntros: Record<string, string> = {
  London: "London is the beating heart of UK padel. With over 120 venues from Shoreditch to Sutton, the capital offers everything from casual pay-and-play to premium membership clubs. Whether you're after rooftop courts with skyline views or a serious training facility, London has it.",
  Manchester: "Manchester's padel scene has exploded. From Carbon Padel Club's 17-court mega facility to intimate clubs in Didsbury and Trafford, the city now rivals London for court density. The Northern Quarter crowd has embraced it as the sport of choice.",
  Bristol: "Bristol punches above its weight in padel. Rocket Padel's arrival supercharged the scene, and local clubs are expanding fast. The mix of indoor and outdoor courts means year-round play, and Bristol's community-first attitude makes it one of the friendliest places to pick up a racket.",
  Birmingham: "The Midlands padel hub. Birmingham's central location and growing club scene make it a natural destination for players across the region. New venues are opening regularly as demand outpaces supply.",
  Leeds: "Yorkshire's padel capital. Leeds has seen rapid growth with new venues catering to beginners and competitive players alike. The city's sports culture means courts fill up fast — book ahead.",
  Edinburgh: "Scotland's padel pioneer. Edinburgh was one of the first Scottish cities to embrace the sport, and its scene continues to grow. Indoor courts mean you can play year-round regardless of the weather.",
  Glasgow: "Glasgow's padel community is tight-knit and growing. Multiple venues now offer courts across the city, with new facilities planned. The competitive scene is heating up with regular tournaments.",
  Newcastle: "The North East's padel hub. Newcastle venues range from dedicated padel centres to multi-sport facilities adding courts to meet demand. A strong social scene makes it easy to find playing partners.",
  Liverpool: "Liverpool's padel scene is young but vibrant. New venues are opening to serve the city's enthusiastic sporting community. Expect this to be one of the fastest-growing padel cities in the UK over the next year.",
  Sheffield: "Steel City is forging a padel identity. Sheffield's mix of indoor and outdoor courts caters to all levels, and the city's proximity to the Peak District makes it a great base for active lifestyles.",
  Cardiff: "Wales' padel capital. Cardiff leads the way for Welsh padel with multiple venues and a growing coaching community. Cross-border players from Bristol often make the trip for the excellent facilities.",
  Nottingham: "Nottingham's padel offering has grown significantly, with venues across the city and surrounding areas. The university influence brings a young, enthusiastic player base.",
  Southampton: "South coast padel at its best. Southampton's venues benefit from milder weather for outdoor play, and the city's sporting infrastructure continues to expand.",
  Brighton: "Brighton's padel scene fits the city perfectly — social, energetic, and growing fast. Coastal courts and a community that loves trying new sports make it one to watch.",
};

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const cityName = decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `Padel Courts in ${cityName}`,
    description: `Find ${cityName}'s best padel courts. Indoor and outdoor venues, coaching, and everything you need to play.`,
  };
}

export default async function CityPage({ params }: Props) {
  const { city: slug } = await params;
  // Convert URL slug to city name: "manchester" -> "Manchester"
  const cityName = decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const { data: venues } = await supabase
    .from('listings')
    .select('id, name, slug, lat, lng, courts, indoor, postcode, address, listing_type, booking_platform, playtomic_url')
    .eq('city', cityName)
    .order('name');

  if (!venues || venues.length === 0) {
    // Don't 404 — let the [slug] catch-all handle it (could be a venue slug)
    return null;
  }

  const courtCount = venues.reduce((sum, v) => sum + (v.courts || 0), 0);
  const indoorCount = venues.filter(v => v.indoor === true).length;
  const outdoorCount = venues.filter(v => v.indoor === false).length;
  const intro = cityIntros[cityName] || `Discover padel courts in ${cityName}. Browse venues, find coaching, and get on court.`;

  return (
    <main className="pb-10">
      <section className="pt-6 pb-10">
        <a href="/find" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
          ← All venues
        </a>
        <div className="label-caps mt-6">City guide</div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Padel in {cityName}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-pm-muted">
          {intro}
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <span className="rounded-full border border-pm-border px-4 py-2 text-pm-muted">
            {venues.length} venue{venues.length !== 1 ? 's' : ''}
          </span>
          {courtCount > 0 && (
            <span className="rounded-full border border-pm-border px-4 py-2 text-pm-muted">
              {courtCount} courts
            </span>
          )}
          {indoorCount > 0 && (
            <span className="rounded-full border border-pm-border px-4 py-2 text-pm-muted">
              {indoorCount} indoor
            </span>
          )}
          {outdoorCount > 0 && (
            <span className="rounded-full border border-pm-border px-4 py-2 text-pm-muted">
              {outdoorCount} outdoor
            </span>
          )}
        </div>
      </section>

      {/* Venue grid */}
      <section>
        <div className="grid gap-3 md:grid-cols-2">
          {venues.map((v) => (
            <a key={v.id} href={`/${v.slug}`} className="card block">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
                  {v.indoor === true ? 'Indoor' : v.indoor === false ? 'Outdoor' : ''}
                  {v.courts ? `${v.indoor !== null ? ' · ' : ''}${v.courts} courts` : ''}
                </span>
                {v.booking_platform && (
                  <span className="text-[10px] text-pm-faint capitalize">{v.booking_platform}</span>
                )}
              </div>
              <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{v.name}</div>
              {v.address && (
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
      <section className="mt-10 text-center">
        <a
          href={`/find?city=${encodeURIComponent(cityName)}`}
          className="btn-primary inline-block"
        >
          View {cityName} on the map →
        </a>
      </section>

      {/* Claim CTA */}
      <section className="mt-14 rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-8">
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

      {/* Newsletter */}
      <section className="mt-14 rounded-3xl bg-pm-text p-10">
        <div className="label-caps !text-pm-accent">The Weekly Note</div>
        <h3 className="mt-3 font-serif text-xl font-semibold text-pm-bg">
          Stay in the loop on {cityName} padel
        </h3>
        <p className="mt-2 text-sm text-pm-faint max-w-md">
          New venues, gear picks, and one thing worth knowing. Every week.
        </p>
        <form
          action="https://buttondown.com/api/emails/embed-subscribe/padelmanual"
          method="post"
          target="popupwindow"
          className="mt-5 max-w-sm"
        >
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-pm-accent/40"
            />
            <button type="submit" className="rounded-full bg-pm-bg px-5 py-3 text-sm font-semibold text-pm-text hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
