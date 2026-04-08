import { getSupabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import PlayTodayBanner from '@/components/PlayTodayBanner';

export const metadata: Metadata = {
  title: 'Best Padel Courts in London 2026 — Our Top Picks',
  description: 'The best padel courts in London, hand-picked by the Padel Manual team. Indoor and outdoor venues with live availability, reviews, and booking links.',
};

export const revalidate = 3600;

// Hand-picked top venues with editorial commentary
const TOP_PICKS = [
  {
    slug: 'rocket-padel-battersea',
    pick: 'Best overall',
    why: 'Four panoramic glass courts overlooking the Thames at Battersea Power Station. It doesn\'t get more spectacular than this. The clubhouse, bar, and bistro make every session feel like an event. Premium pricing but worth it for the experience.',
  },
  {
    slug: 'padel-social-club-the-o2',
    pick: 'Best for beginners',
    why: 'Welcoming atmosphere with excellent intro sessions. The O2 location means good transport links and plenty to do before or after your game. Consistent court quality and helpful staff.',
  },
  {
    slug: 'stratford-padel-club',
    pick: 'Best value',
    why: 'London\'s largest padel club with competitive pricing, especially off-peak. Plenty of courts means you can usually find availability even at short notice. Good coaching programmes too.',
  },
  {
    slug: 'padium',
    pick: 'Best for serious players',
    why: 'Premium facility in Canary Wharf with AI-powered game analysis. The tech-forward approach appeals to competitive players who want to track their improvement. Not cheap, but the data and coaching are genuinely useful.',
  },
  {
    slug: 'rocks-lane-chiswick',
    pick: 'Best outdoor courts',
    why: 'Beautiful setting in West London with well-maintained outdoor courts. The club atmosphere is friendly and social. Works best in summer but hardy players use it year-round.',
  },
  {
    slug: 'game4padel-islington',
    pick: 'Best in North London',
    why: 'Convenient location with indoor courts that stay busy for good reason. Clean facilities, easy booking, and a good mix of social and competitive players.',
  },
  {
    slug: 'abc',
    pick: 'Best indoor facility',
    why: 'Seven indoor courts in the City of London. The sheer number of courts means there\'s almost always availability. Popular with the after-work crowd and for good reason — the courts are excellent.',
  },
  {
    slug: 'padel-social-club-earls-court',
    pick: 'Best in West London',
    why: 'Earls Court location with easy tube access. Good court quality and a social atmosphere that makes it easy to find playing partners. Regular events and social sessions.',
  },
];

export default async function BestLondonPage() {
  const supabase = getSupabase();
  // Fetch the actual venue data for our picks
  const slugs = TOP_PICKS.map(p => p.slug);
  const { data: venues } = await supabase
    .from('listings')
    .select('*')
    .in('slug', slugs);

  const venueMap = new Map((venues || []).map(v => [v.slug, v]));

  // Also get total London venue count
  const { count } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('city', 'London')
    .eq('listing_type', 'venue');

  return (
    <main className="pb-10">
      <article className="max-w-2xl">
        <section className="pb-8 pt-6">
          <div className="label-caps">London</div>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Best padel courts in London
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            Our honest picks from {count || 126} London venues. These are the courts we&apos;d actually book ourselves — not a list of everyone who paid to be included.
          </p>
          <p className="mt-2 text-sm text-pm-faint">
            Updated March 2026 · Based on court quality, atmosphere, value, and live availability data
          </p>
        </section>

        <div className="space-y-6">
          {TOP_PICKS.map((pick, i) => {
            const venue = venueMap.get(pick.slug);
            if (!venue) return null;

            return (
              <a
                key={pick.slug}
                href={`/${pick.slug}`}
                className="block rounded-2xl border border-pm-border/40 bg-white p-6 md:p-8 hover:border-pm-accent/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-pm-accent">#{i + 1}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint bg-pm-bg px-2 py-0.5 rounded">
                        {pick.pick}
                      </span>
                    </div>
                    <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight">{venue.name}</h2>
                    <div className="mt-1 text-xs text-pm-faint">
                      {venue.address || venue.city || 'London'}
                      {venue.courts ? ` · ${venue.courts} courts` : ''}
                      {venue.indoor !== null ? ` · ${venue.indoor ? 'Indoor' : 'Outdoor'}` : ''}
                    </div>
                  </div>
                  {(venue as any).playtomic_tenant_id && (
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-medium text-emerald-700 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live availability
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm text-pm-muted leading-relaxed">{pick.why}</p>
                <div className="mt-4 text-xs font-medium text-pm-accent">View listing + live availability →</div>
              </a>
            );
          })}
        </div>

        {/* Methodology */}
        <section className="mt-10 rounded-xl border border-pm-border/30 bg-pm-bg-card p-6">
          <h3 className="text-sm font-semibold text-pm-text mb-2">How we picked these</h3>
          <p className="text-xs text-pm-muted leading-relaxed">
            We considered court quality, atmosphere, location, value for money, coaching availability,
            and real booking data from Playtomic. These picks reflect genuine editorial opinion — no venue
            has paid to be included. We update this list quarterly.
          </p>
        </section>

        {/* CTAs */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <a href="/find?city=London" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">All London venues</div>
            <p className="mt-1 text-xs text-pm-faint">{count || 126} courts on the map</p>
          </a>
          <a href="/quiz" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Racket quiz</div>
            <p className="mt-1 text-xs text-pm-faint">Find your perfect racket</p>
          </a>
        </div>

        {/* Other cities */}
        <section className="mt-8">
          <h3 className="font-serif text-lg font-semibold tracking-tight mb-3">Other cities</h3>
          <div className="flex flex-wrap gap-2">
            {['Manchester', 'Bristol', 'Birmingham', 'Leeds', 'Edinburgh', 'Liverpool', 'Glasgow', 'Newcastle'].map(city => (
              <a key={city} href={`/city/${city.toLowerCase()}`} className="rounded-full border border-pm-border px-4 py-2 text-xs text-pm-muted hover:bg-pm-bg-hover hover:text-pm-text transition-all">
                {city}
              </a>
            ))}
          </div>
        </section>

        <div className="mt-12">
          <PlayTodayBanner city="London" />
        </div>
      </article>
    </main>
  );
}
