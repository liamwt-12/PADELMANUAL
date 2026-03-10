import { getVenueCount, getCoachCount, getCourtTotal, getTopCities, getFeaturedVenues } from "@/lib/db";
import { gearItems } from "@/lib/gear";
import { createClient } from "@supabase/supabase-js";
import HomeSearch from "./HomeSearch";

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const [venueCount, coachCount, courtTotal, topCities, featuredVenues] = await Promise.all([
    getVenueCount(),
    getCoachCount(),
    getCourtTotal(),
    getTopCities(8),
    getFeaturedVenues(4),
  ]);

  // Get all cities for search autocomplete
  const { data: citiesData } = await supabase
    .from('listings')
    .select('city')
    .eq('listing_type', 'venue')
    .not('city', 'is', null);
  const allCities = [...new Set((citiesData || []).map(c => c.city).filter(Boolean))].sort() as string[];

  const gearPick = gearItems[0]?.products[0];

  return (
    <main className="pb-8">
      {/* ── Hero with Search ── */}
      <section className="pt-10 pb-14 md:pt-14 md:pb-20">
        <h1 className="max-w-[600px] font-serif text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          Find padel courts<br />across the UK.
        </h1>
        <p className="mt-4 max-w-[420px] text-base leading-relaxed text-pm-muted md:text-lg">
          {venueCount} venues. {courtTotal.toLocaleString()} courts. Live availability.
          The only UK padel directory with real-time booking data.
        </p>

        {/* Search box */}
        <div className="mt-8">
          <HomeSearch cities={allCities} venueCount={venueCount} />
        </div>

        {/* Quick stats */}
        <div className="mt-8 flex gap-6 md:gap-10">
          <a href="/find" className="group">
            <div className="font-serif text-3xl md:text-4xl font-bold text-pm-text group-hover:text-pm-accent transition-colors">{venueCount}</div>
            <div className="text-xs text-pm-faint mt-0.5">venues</div>
          </a>
          <div>
            <div className="font-serif text-3xl md:text-4xl font-bold text-pm-text">{courtTotal.toLocaleString()}</div>
            <div className="text-xs text-pm-faint mt-0.5">courts</div>
          </div>
          <div>
            <div className="font-serif text-3xl md:text-4xl font-bold text-emerald-600 flex items-center gap-2">
              223
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-xs text-pm-faint mt-0.5">with live availability</div>
          </div>
        </div>
      </section>

      {/* ── Top Cities ── */}
      <section className="rounded-2xl border border-pm-border/60 bg-pm-bg-card p-8 md:p-10">
        <div className="label-caps">Popular cities</div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {topCities.map(({ city, count }) => (
            <a
              key={city}
              href={`/city/${encodeURIComponent(city.toLowerCase())}`}
              className="group rounded-xl border border-pm-border/40 bg-white px-4 py-3.5 hover:border-pm-accent/40 hover:bg-pm-bg-hover transition-all"
            >
              <div className="font-semibold text-sm text-pm-text group-hover:text-pm-accent transition-colors">{city}</div>
              <div className="text-xs text-pm-faint mt-0.5">{count} venue{count !== 1 ? "s" : ""}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Quiz CTA ── */}
      <section className="mt-14 rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-8 md:p-10 md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <div className="label-caps">Not sure what racket to buy?</div>
          <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Find your perfect racket in 30 seconds</h3>
          <p className="mt-2 text-sm text-pm-muted max-w-md">Five questions. Three personalised recommendations with prices and reviews.</p>
        </div>
        <a href="/quiz" className="mt-4 md:mt-0 btn-primary inline-block shrink-0">Take the quiz →</a>
      </section>

      {/* ── Featured Venues ── */}
      {featuredVenues.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight">Where to play</h2>
              <p className="mt-1 text-sm text-pm-faint">{courtTotal.toLocaleString()} courts across {venueCount} venues</p>
            </div>
            <a href="/find" className="text-xs font-medium text-pm-faint hover:text-pm-text transition-colors">Find courts →</a>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {featuredVenues.map((v) => (
              <a key={v.id} href={`/${v.slug}`} className="card block">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
                    {v.indoor ? "Indoor" : "Outdoor"}{v.courts ? ` · ${v.courts} courts` : ""}
                  </span>
                  <span className="text-[10px] font-medium text-pm-faint">{v.city}</span>
                </div>
                <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{v.name}</div>
                {v.address && <p className="mt-2 text-[13px] leading-relaxed text-pm-muted truncate">{v.address}</p>}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Gear Pick ── */}
      {gearPick && (
        <section className="mt-14 rounded-2xl border border-pm-border/60 bg-pm-bg-card p-8 md:p-10">
          <div className="label-caps">Gear pick of the week</div>
          <div className="mt-4 md:flex md:items-start md:justify-between md:gap-8">
            <div className="max-w-lg">
              <h2 className="font-serif text-2xl font-semibold tracking-tight">{gearPick.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-pm-muted">{gearPick.verdict}</p>
              <p className="mt-2 text-sm text-pm-faint">Best for: {gearPick.bestFor}</p>
            </div>
            <div className="mt-4 md:mt-0 md:text-right shrink-0">
              <div className="text-lg font-semibold text-pm-accent">{gearPick.price}</div>
              <a href={gearPick.url || gearPick.amazonUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 inline-block text-xs font-medium text-pm-muted underline underline-offset-4 hover:text-pm-text transition-colors">
                View on Padel Market →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── Guides ── */}
      <section className="mt-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Learn</h2>
          <a href="/gear" className="text-xs font-medium text-pm-faint hover:text-pm-text transition-colors">All guides →</a>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <a href="/guides/padel-vs-tennis" className="card block">
            <div className="label-caps">Guide</div>
            <div className="mt-3 font-serif text-base font-semibold tracking-tight">Padel vs Tennis</div>
            <p className="mt-2 text-[13px] text-pm-muted">What&apos;s the difference?</p>
          </a>
          <a href="/guides/padel-cost-uk" className="card block">
            <div className="label-caps">Guide</div>
            <div className="mt-3 font-serif text-base font-semibold tracking-tight">How Much Does Padel Cost?</div>
            <p className="mt-2 text-[13px] text-pm-muted">Real UK prices for 2026</p>
          </a>
          <a href="/guides/padel-rules" className="card block">
            <div className="label-caps">Guide</div>
            <div className="mt-3 font-serif text-base font-semibold tracking-tight">Padel Rules</div>
            <p className="mt-2 text-[13px] text-pm-muted">Everything you need to know</p>
          </a>
        </div>
      </section>

      {/* ── Gear Guides ── */}
      <section className="mt-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Gear</h2>
          <a href="/gear/shop" className="text-xs font-medium text-pm-accent hover:text-pm-text transition-colors">Browse 1,400+ products →</a>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {gearItems.map((g) => (
            <a key={g.slug} href={`/gear/${g.slug}`} className="card block">
              <div className="label-caps">{g.category}</div>
              <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{g.title}</div>
              <p className="mt-2 text-[13px] text-pm-muted">{g.headline}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ── Claim CTA ── */}
      <section className="mt-14 rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-8 md:p-10">
        <div className="md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <div className="label-caps">For venues & coaches</div>
            <h3 className="mt-3 font-serif text-xl font-semibold tracking-tight">Your listing is already here.</h3>
            <p className="mt-2 text-sm text-pm-muted max-w-md leading-relaxed">
              Every padel venue in the UK has a free profile on Padel Manual.
              Claim yours to update your details, add photos, and connect with players.
            </p>
          </div>
          <a href="/find" className="mt-6 md:mt-0 btn-primary inline-block shrink-0">Find your listing →</a>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="mt-16 rounded-3xl bg-pm-text p-10 md:p-14">
        <div className="label-caps !text-pm-accent">The Weekly Note</div>
        <h3 className="mt-4 max-w-md font-serif text-2xl font-semibold leading-tight text-pm-bg md:text-3xl">
          One gear pick. One spotlight.<br />One thing worth knowing.
        </h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-pm-faint">
          A short weekly email for UK padel players. Plain text. No noise. Just the good stuff.
        </p>
        <form action="https://buttondown.com/api/emails/embed-subscribe/padelmanual" method="post" target="popupwindow" className="mt-7 max-w-md">
          <div className="flex gap-2">
            <input type="email" name="email" placeholder="your@email.com" required className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-pm-accent/40" />
            <button type="submit" className="rounded-full bg-pm-bg px-6 py-3 text-sm font-semibold text-pm-text hover:opacity-90 transition-opacity">Subscribe</button>
          </div>
        </form>
        <p className="mt-3 text-[11px] text-white/20">Free. Unsubscribe anytime.</p>
      </section>
    </main>
  );
}
