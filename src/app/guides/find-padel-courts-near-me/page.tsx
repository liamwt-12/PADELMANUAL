import { getSupabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import NewsletterSignup from '@/components/NewsletterSignup';

export const metadata: Metadata = {
  title: 'How to Find Padel Courts Near You in the UK',
  description: 'Find padel courts near you with live availability. Search by city, postcode, or train station across 500+ UK venues. Book online in seconds.',
  alternates: { canonical: 'https://www.padelmanual.com/guides/find-padel-courts-near-me' },
  openGraph: {
    title: 'How to Find Padel Courts Near You in the UK',
    description: 'Find padel courts near you with live availability. Search by city, postcode, or train station across 500+ UK venues.',
    url: 'https://www.padelmanual.com/guides/find-padel-courts-near-me',
  },
};

export const revalidate = 86400;

export default async function FindCourtsPage() {
  const supabase = getSupabase();

  const { count: venueCount } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('listing_type', 'venue');

  const { data: cityData } = await supabase
    .from('listings')
    .select('city')
    .eq('listing_type', 'venue')
    .not('city', 'is', null);

  const cityCounts: Record<string, number> = {};
  (cityData || []).forEach(v => {
    if (!v.city) return;
    cityCounts[v.city] = (cityCounts[v.city] || 0) + 1;
  });
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const totalVenues = venueCount || 500;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Find Padel Courts Near You in the UK',
    description: 'Find padel courts near you with live availability across 500+ UK venues.',
    author: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    publisher: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    mainEntityOfPage: 'https://www.padelmanual.com/guides/find-padel-courts-near-me',
  };

  return (
    <main className="pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-2xl">
        <section className="pb-8 pt-6">
          <div className="label-caps">Guide</div>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            How to find padel courts near you
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            The UK now has {totalVenues}+ padel venues. Here is how to find the ones closest to you, check live availability, and book a court in under a minute.
          </p>
        </section>

        <div className="space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The quickest way: Play Today</h2>
            <p>
              <a href="/play-today" className="text-pm-accent hover:text-pm-text transition-colors">Play Today</a> is our live availability tool. It pulls real-time court slots from Playtomic — the booking platform used by most UK padel venues — and shows you what is available right now, this evening, or tomorrow. Enter your city, pick a time, and see every available court at a glance.
            </p>
            <p className="mt-3">
              This is the fastest route from &ldquo;I want to play padel&rdquo; to a confirmed booking. No need to visit ten different venue websites. One search, all results, book directly.
            </p>
            <div className="mt-4 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-4">
              <p className="text-xs font-medium text-pm-accent">Ready to play?</p>
              <a href="/play-today" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Check live court availability →</a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Search by city</h2>
            <p>
              Every major UK city now has padel courts, and most have multiple venues to choose from. Our <a href="/find" className="text-pm-accent hover:text-pm-text transition-colors">venue directory</a> lets you browse by city, with details on court count, indoor/outdoor, pricing, and reviews for each venue.
            </p>
            <div className="mt-4 rounded-2xl border border-pm-border/40 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-pm-bg-card">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">City</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Venues</th>
                  </tr>
                </thead>
                <tbody>
                  {topCities.map(([city, count]) => (
                    <tr key={city} className="border-t border-pm-border/30">
                      <td className="px-4 py-3 font-medium text-pm-text">
                        <a href={`/city/${city.toLowerCase()}`} className="hover:text-pm-accent transition-colors">{city}</a>
                      </td>
                      <td className="px-4 py-3 text-right text-pm-faint">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-pm-faint">Showing top {topCities.length} cities by venue count. <a href="/find" className="text-pm-accent hover:text-pm-text transition-colors">View all →</a></p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Search by train station</h2>
            <p>
              If you commute by train, finding a court near your station can turn a dead evening into a padel session. We have mapped padel venues within walking distance of London Underground stations and major UK train stations. Search by station name to find the closest courts.
            </p>
            <p className="mt-3">
              This is particularly useful in London, where venues near Zone 1–3 stations mean you can play after work without a long detour. <a href="/padel/station" className="text-pm-accent hover:text-pm-text transition-colors">Browse all station pages →</a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Search by postcode</h2>
            <p>
              Enter your postcode area (e.g. SW11, M1, BS1) on our <a href="/find" className="text-pm-accent hover:text-pm-text transition-colors">venue finder</a> to see courts nearest to you. Each venue listing shows distance, court count, whether they are indoor or outdoor, and links directly to their booking page.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">How to book via Playtomic</h2>
            <p>
              Most UK padel venues use <strong className="text-pm-text">Playtomic</strong> as their booking platform. It works like this:
            </p>
            <ol className="mt-3 space-y-2 list-decimal list-inside">
              <li>Find a venue through Padel Manual or the Playtomic app</li>
              <li>Select your date and preferred time slot</li>
              <li>Choose your court (indoor or outdoor, if both are available)</li>
              <li>Pay online — most venues require full payment upfront</li>
              <li>Turn up and play. The gate code or reception details are sent with your confirmation.</li>
            </ol>
            <p className="mt-3">
              Some venues use their own booking systems (ClubSpark, CourtReserve, or their own website). These are linked from the venue page on Padel Manual so you can book directly wherever the venue prefers.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">What to look for in a venue</h2>
            <p>
              Not all padel venues are equal. Here is what separates the good ones:
            </p>
            <ul className="mt-3 space-y-2">
              <li><strong className="text-pm-text">Indoor vs outdoor.</strong> Indoor courts mean year-round play regardless of British weather. Outdoor courts are fine in summer but can be cancelled for rain or frost. Some venues have covered outdoor courts — a good middle ground.</li>
              <li><strong className="text-pm-text">Court surface.</strong> Most UK courts use artificial grass with sand infill. Some indoor venues have panoramic courts (full glass walls with no mesh) — these play faster and are considered the premium experience.</li>
              <li><strong className="text-pm-text">Coaching and social sessions.</strong> If you are a beginner, look for venues that run regular group sessions, mixers, and Americano tournaments. These are how you find partners and improve quickly.</li>
              <li><strong className="text-pm-text">Facilities.</strong> Changing rooms, showers, a café or bar, and a decent car park matter — especially if padel is part of your social life rather than just exercise.</li>
              <li><strong className="text-pm-text">Reviews.</strong> Google reviews and Playtomic ratings are the most reliable indicators. Look for consistent mentions of court quality, staff, and atmosphere.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Peak vs off-peak</h2>
            <p>
              Peak hours are weekday evenings (6–9pm) and weekends. Off-peak — weekday mornings and early afternoons — is significantly cheaper, typically 20–30% less. If your schedule allows it, off-peak play is excellent value and the courts are quieter.
            </p>
            <div className="mt-4 rounded-xl border border-pm-border/40 bg-pm-bg-card p-4">
              <a href="/guides/how-much-does-padel-cost" className="text-xs text-pm-accent font-medium hover:text-pm-text transition-colors">Full pricing guide →</a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">New to padel?</h2>
            <p>
              If you have never played before, do not overthink the venue choice. Pick the closest one with good reviews, book a beginner session or an hour-long court with friends, and go. Most venues hire out rackets and provide balls. All you need is sportswear and court shoes.
            </p>
            <div className="mt-4 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-4">
              <p className="text-xs font-medium text-pm-accent">Just getting started?</p>
              <a href="/guides/how-to-start-playing-padel" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Read our beginner guide →</a>
            </div>
          </section>
        </div>

        {/* CTAs */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/play-today" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Play today</div>
            <p className="mt-1 text-xs text-pm-faint">Live court availability near you</p>
          </a>
          <a href="/find" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">All venues</div>
            <p className="mt-1 text-xs text-pm-faint">{totalVenues}+ venues across the UK</p>
          </a>
        </div>

        <div className="mt-10">
          <NewsletterSignup />
        </div>
      </article>
    </main>
  );
}
