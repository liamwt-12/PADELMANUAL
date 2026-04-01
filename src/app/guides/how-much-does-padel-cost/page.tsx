import { getSupabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import NewsletterSignup from '@/components/NewsletterSignup';

export const metadata: Metadata = {
  title: 'How Much Does Padel Cost in the UK? (2026 Price Guide)',
  description: 'Real padel prices from UK venues in 2026. Court hire by city (peak & off-peak), equipment costs, coaching rates, and how to play on a budget.',
  alternates: { canonical: 'https://www.padelmanual.com/guides/how-much-does-padel-cost' },
  openGraph: {
    title: 'How Much Does Padel Cost in the UK? (2026 Price Guide)',
    description: 'Real padel prices from UK venues in 2026. Court hire by city, equipment costs, coaching rates, and how to play on a budget.',
    url: 'https://www.padelmanual.com/guides/how-much-does-padel-cost',
  },
};

export const revalidate = 86400;

type CityPriceData = {
  city: string;
  venues: number;
  avgPeak: number | null;
  avgOffpeak: number | null;
};

export default async function PadelCostPage() {
  const supabase = getSupabase();

  const { data: priceData } = await supabase
    .from('listings')
    .select('city, price_per_hour_peak, price_per_hour_offpeak')
    .eq('listing_type', 'venue')
    .not('city', 'is', null);

  // Aggregate price data by city
  const cityAgg: Record<string, { count: number; peakTotal: number; peakCount: number; offpeakTotal: number; offpeakCount: number }> = {};
  (priceData || []).forEach(v => {
    if (!v.city) return;
    if (!cityAgg[v.city]) cityAgg[v.city] = { count: 0, peakTotal: 0, peakCount: 0, offpeakTotal: 0, offpeakCount: 0 };
    cityAgg[v.city].count++;
    if (v.price_per_hour_peak) {
      cityAgg[v.city].peakTotal += v.price_per_hour_peak;
      cityAgg[v.city].peakCount++;
    }
    if (v.price_per_hour_offpeak) {
      cityAgg[v.city].offpeakTotal += v.price_per_hour_offpeak;
      cityAgg[v.city].offpeakCount++;
    }
  });

  const cityPrices: CityPriceData[] = Object.entries(cityAgg)
    .filter(([, d]) => d.count >= 3)
    .map(([city, d]) => ({
      city,
      venues: d.count,
      avgPeak: d.peakCount > 0 ? Math.round(d.peakTotal / d.peakCount) : null,
      avgOffpeak: d.offpeakCount > 0 ? Math.round(d.offpeakTotal / d.offpeakCount) : null,
    }))
    .sort((a, b) => b.venues - a.venues)
    .slice(0, 12);

  const totalVenues = Object.values(cityAgg).reduce((s, c) => s + c.count, 0);

  // Overall averages
  const allPeakPrices = (priceData || []).filter(v => v.price_per_hour_peak).map(v => v.price_per_hour_peak!);
  const allOffpeakPrices = (priceData || []).filter(v => v.price_per_hour_offpeak).map(v => v.price_per_hour_offpeak!);
  const avgPeakAll = allPeakPrices.length > 0 ? Math.round(allPeakPrices.reduce((a, b) => a + b, 0) / allPeakPrices.length) : null;
  const avgOffpeakAll = allOffpeakPrices.length > 0 ? Math.round(allOffpeakPrices.reduce((a, b) => a + b, 0) / allOffpeakPrices.length) : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How Much Does Padel Cost in the UK? (2026 Price Guide)',
    description: 'Real padel prices from UK venues in 2026.',
    author: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    publisher: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    mainEntityOfPage: 'https://www.padelmanual.com/guides/how-much-does-padel-cost',
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
            How much does padel cost in the UK?
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            Real prices from {totalVenues} UK venues. Court hire, equipment, coaching, memberships — and how to keep costs down.
          </p>
        </section>

        <div className="space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Court hire: the headline number</h2>
            <p>
              A padel court in the UK costs{avgPeakAll ? <> around <strong className="text-pm-text">£{avgPeakAll} per hour</strong> at peak times</> : <> <strong className="text-pm-text">£40–60 per hour</strong> at peak times</>}{avgOffpeakAll ? <> and <strong className="text-pm-text">£{avgOffpeakAll} per hour</strong> off-peak</> : <> and 20–30% less off-peak</>}. Padel is always doubles, so split four ways that is <strong className="text-pm-text">{avgPeakAll ? `£${Math.round(avgPeakAll / 4)}–${Math.round((avgPeakAll * 1.2) / 4)}` : '£10–15'} per person</strong>.
            </p>
            <p className="mt-3">
              That puts padel in the same bracket as a gym session or a round of drinks. For an hour of competitive, social sport, it is genuinely good value. Peak hours are weekday evenings (6–9pm) and weekends. Off-peak — weekday mornings and early afternoons — offers the best rates.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Prices by city</h2>
            <p className="mb-4">
              Prices vary by location. London commands a premium; cities in the Midlands and the North tend to be cheaper. These figures are drawn from real booking data across our directory.
            </p>
            {cityPrices.length > 0 && (
              <div className="rounded-2xl border border-pm-border/40 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-pm-bg-card">
                      <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">City</th>
                      <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Venues</th>
                      <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Avg peak/hr</th>
                      <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Avg off-peak/hr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cityPrices.map((row) => (
                      <tr key={row.city} className="border-t border-pm-border/30">
                        <td className="px-4 py-3 font-medium text-pm-text">
                          <a href={`/city/${row.city.toLowerCase()}`} className="hover:text-pm-accent transition-colors">{row.city}</a>
                        </td>
                        <td className="px-4 py-3 text-right text-pm-faint">{row.venues}</td>
                        <td className="px-4 py-3 text-right font-medium text-pm-text">{row.avgPeak ? `£${row.avgPeak}` : '—'}</td>
                        <td className="px-4 py-3 text-right text-pm-accent">{row.avgOffpeak ? `£${row.avgOffpeak}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-2 text-[11px] text-pm-faint">Average prices from venues with published rates. Actual prices vary by venue, court type, and time slot.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Equipment costs</h2>
            <p>
              You do not need any equipment to start — most venues hire out rackets for £3–5 and provide balls. When you are ready to invest, here is what to expect:
            </p>
            <div className="mt-4 rounded-2xl border border-pm-border/40 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-pm-bg-card">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Item</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Budget</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Mid-range</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: 'Racket', budget: '£40–70', mid: '£80–150', premium: '£150–350', link: '/gear/rackets' },
                    { item: 'Shoes', budget: '£40–60', mid: '£65–95', premium: '£100–150', link: '/gear/shoes' },
                    { item: 'Balls (3 pack)', budget: '£5–6', mid: '£6–8', premium: '£8–10', link: '/gear/balls' },
                    { item: 'Bag', budget: '£20–35', mid: '£40–65', premium: '£70–120', link: '/gear/bags' },
                    { item: 'Overgrip (3 pack)', budget: '£4–6', mid: '£6–8', premium: '£8–12', link: '/gear/accessories' },
                  ].map((row) => (
                    <tr key={row.item} className="border-t border-pm-border/30">
                      <td className="px-4 py-3 font-medium text-pm-text">
                        <a href={row.link} className="hover:text-pm-accent transition-colors">{row.item}</a>
                      </td>
                      <td className="px-4 py-3 text-right">{row.budget}</td>
                      <td className="px-4 py-3 text-right">{row.mid}</td>
                      <td className="px-4 py-3 text-right">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              To get started with your own gear, budget around <strong className="text-pm-text">£80–130</strong> for a racket, shoes, and balls. That is everything you need for the first year.
            </p>
            <div className="mt-4 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-4">
              <p className="text-xs font-medium text-pm-accent">Find the right racket for your budget</p>
              <div className="flex gap-3 mt-2">
                <a href="/gear/rackets/under-100" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Under £100 →</a>
                <a href="/gear/rackets/under-150" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Under £150 →</a>
                <a href="/quiz" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Take the quiz →</a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Coaching costs</h2>
            <p>
              Group coaching sessions typically cost <strong className="text-pm-text">£15–25 per person</strong> for 60–90 minutes. Private coaching runs <strong className="text-pm-text">£40–70 per hour</strong>. Most venues offer introductory &ldquo;try padel&rdquo; sessions for £10–15 per person, which include basic coaching, racket hire, and court time — the best-value way to start.
            </p>
            <p className="mt-3">
              Regular group coaching is the most effective way to improve. Weekly sessions over a 6–8 week block typically cost £120–180, which works out to less than a private lesson.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Membership vs pay-and-play</h2>
            <p>
              Most UK padel venues operate on a <strong className="text-pm-text">pay-and-play</strong> model — no commitment, book when you want. Some clubs offer memberships, typically £25–50 per month, that give you discounted court rates, priority booking, and access to members-only sessions.
            </p>
            <p className="mt-3">
              A membership makes sense if you play twice a week or more at the same venue. Below that, pay-and-play is more cost-effective and gives you the flexibility to try different venues.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">How to play padel on a budget</h2>
            <p>
              There are several ways to keep costs down without compromising on quality of play:
            </p>
            <ul className="mt-3 space-y-2">
              <li><strong className="text-pm-text">Book off-peak.</strong> Weekday mornings and early afternoons can be 20–30% cheaper than evening and weekend slots.</li>
              <li><strong className="text-pm-text">Join social sessions.</strong> Drop-in mixers and Americano tournaments cost £10–15 per person and split court costs efficiently.</li>
              <li><strong className="text-pm-text">Use intro offers.</strong> Many venues offer first-session discounts or free racket hire for beginners.</li>
              <li><strong className="text-pm-text">Buy equipment smart.</strong> A £50 beginner racket from <a href="/gear/rackets/under-100" className="text-pm-accent hover:text-pm-text transition-colors">our under-£100 range</a> will serve you well for your first year. No need to spend more until your technique demands it.</li>
              <li><strong className="text-pm-text">Buy balls in bulk.</strong> A case of 24 balls costs significantly less per ball than individual tubes.</li>
            </ul>
            <p className="mt-3">
              At its cheapest, padel costs under £8 per person for an hour. That is less than a gym session and considerably more enjoyable.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The real monthly cost</h2>
            <p>
              Playing once a week at an average UK venue costs roughly <strong className="text-pm-text">£40–60 per month</strong> (your share of court hire). Add equipment replacement every 12–18 months and the occasional pack of balls, and a regular player spends about <strong className="text-pm-text">£60–80 per month</strong>.
            </p>
            <p className="mt-3">
              For context: a mid-range gym membership runs £30–50 per month. A golf club £100–200. Tennis at a private club £80–150. Padel sits in a competitive position — cheaper than most racket sports, with a social element that a gym cannot replicate.
            </p>
          </section>
        </div>

        {/* CTAs */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/play-today" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find courts near you</div>
            <p className="mt-1 text-xs text-pm-faint">Live availability from {totalVenues}+ venues</p>
          </a>
          <a href="/gear/rackets/under-100" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Rackets under £100</div>
            <p className="mt-1 text-xs text-pm-faint">Quality gear without the premium price</p>
          </a>
        </div>

        <div className="mt-10">
          <NewsletterSignup />
        </div>
      </article>
    </main>
  );
}
