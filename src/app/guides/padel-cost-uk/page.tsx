import { getSupabase } from '@/lib/supabase';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Much Does Padel Cost in the UK? (2026 Prices)',
  description: 'Real padel court prices across the UK in 2026. Average costs by city, what equipment costs, and how to play on a budget.',
};

export const revalidate = 86400; // daily

export default async function PadelCostPage() {
  const supabase = getSupabase();
  // Get venue stats by city
  const { data: cityStats } = await supabase
    .from('listings')
    .select('city, courts')
    .eq('listing_type', 'venue')
    .not('city', 'is', null);

  const cities: Record<string, { count: number; totalCourts: number }> = {};
  (cityStats || []).forEach(v => {
    if (!v.city) return;
    if (!cities[v.city]) cities[v.city] = { count: 0, totalCourts: 0 };
    cities[v.city].count++;
    cities[v.city].totalCourts += v.courts || 0;
  });

  const totalVenues = Object.values(cities).reduce((s, c) => s + c.count, 0);
  const topCities = Object.entries(cities).sort((a, b) => b[1].count - a[1].count).slice(0, 10);

  return (
    <main className="pb-10">
      <article className="max-w-2xl">
        <section className="pb-8 pt-6">
          <div className="label-caps">Guide</div>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            How much does padel cost in the UK?
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            Real prices from {totalVenues} UK venues. What you&apos;ll pay for court hire, equipment, coaching, and how to play padel on a budget.
          </p>
        </section>

        <div className="space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Court hire: the headline number</h2>
            <p>
              A typical padel court in the UK costs <strong className="text-pm-text">£40-60 per hour</strong>. Split between four players (padel is always doubles), that&apos;s <strong className="text-pm-text">£10-15 per person per hour</strong>. Some venues charge per person rather than per court, typically £12-18.
            </p>
            <p className="mt-3">
              Peak times (evenings and weekends) are more expensive. Off-peak slots — weekday mornings and early afternoons — can be 20-30% cheaper. If you&apos;re flexible on timing, you can play for under £10 per person.
            </p>
          </section>

          {/* Price by city */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Prices by city</h2>
            <p className="mb-4">
              Prices vary significantly by location. London is the most expensive; northern cities and smaller towns tend to be cheaper.
            </p>
            <div className="rounded-2xl border border-pm-border/40 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-pm-bg-card">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">City</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Venues</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Typical price/hr</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Per person</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { city: 'London', venues: 126, price: '£45-80', pp: '£12-20' },
                    { city: 'Manchester', venues: 15, price: '£36-55', pp: '£9-14' },
                    { city: 'Bristol', venues: 16, price: '£36-50', pp: '£9-13' },
                    { city: 'Birmingham', venues: 14, price: '£32-48', pp: '£8-12' },
                    { city: 'Leeds', venues: 11, price: '£30-50', pp: '£8-13' },
                    { city: 'Edinburgh', venues: 9, price: '£36-52', pp: '£9-13' },
                    { city: 'Liverpool', venues: 8, price: '£30-48', pp: '£8-12' },
                    { city: 'Newcastle', venues: 6, price: '£28-45', pp: '£7-11' },
                    { city: 'Sheffield', venues: 6, price: '£28-44', pp: '£7-11' },
                    { city: 'Cardiff', venues: 6, price: '£30-48', pp: '£8-12' },
                  ].map((row) => (
                    <tr key={row.city} className="border-t border-pm-border/30">
                      <td className="px-4 py-3 font-medium text-pm-text">
                        <a href={`/city/${row.city.toLowerCase()}`} className="hover:text-pm-accent transition-colors">{row.city}</a>
                      </td>
                      <td className="px-4 py-3 text-right text-pm-faint">{row.venues}</td>
                      <td className="px-4 py-3 text-right font-medium text-pm-text">{row.price}</td>
                      <td className="px-4 py-3 text-right text-pm-accent">{row.pp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-pm-faint">Prices are estimates based on publicly available booking data. Actual prices vary by venue and time slot.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Equipment costs</h2>
            <div className="rounded-2xl border border-pm-border/40 overflow-hidden">
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
                    { item: 'Racket', budget: '£40-70', mid: '£80-150', premium: '£150-350' },
                    { item: 'Shoes', budget: '£40-60', mid: '£65-95', premium: '£100-150' },
                    { item: 'Balls (3 pack)', budget: '£5-6', mid: '£6-8', premium: '£8-10' },
                    { item: 'Bag', budget: '£20-35', mid: '£40-65', premium: '£70-120' },
                    { item: 'Overgrip (3 pack)', budget: '£4-6', mid: '£6-8', premium: '£8-12' },
                  ].map((row) => (
                    <tr key={row.item} className="border-t border-pm-border/30">
                      <td className="px-4 py-3 font-medium text-pm-text">{row.item}</td>
                      <td className="px-4 py-3 text-right">{row.budget}</td>
                      <td className="px-4 py-3 text-right">{row.mid}</td>
                      <td className="px-4 py-3 text-right">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              To get started with your own gear, budget around <strong className="text-pm-text">£80-130</strong> for a racket, shoes, and balls. Most venues offer racket hire for £3-5 if you want to try before you buy.
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
              Group coaching sessions typically cost <strong className="text-pm-text">£15-25 per person</strong> for 60-90 minutes. Private coaching runs <strong className="text-pm-text">£40-70 per hour</strong>. Most venues offer &quot;intro to padel&quot; sessions for £10-15 per person which include basic coaching and court time — these are the best value way to start.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Membership vs pay-and-play</h2>
            <p>
              Most UK padel venues operate on a pay-and-play model — you book a court when you want it, no membership required. Some clubs offer memberships (typically £25-50 per month) that give you discounted court rates and priority booking. Memberships make sense if you play twice a week or more.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">How to play padel on a budget</h2>
            <p>
              Book off-peak slots (weekday daytime). Use intro offers — many venues offer first-session discounts. Borrow or hire rackets before buying. Buy balls in bulk. Join social sessions rather than booking a full court — most venues run drop-in sessions where you share court costs with other players.
            </p>
            <p className="mt-3">
              At its cheapest, padel can cost under £8 per person for an hour. That&apos;s cheaper than a gym session and more fun than a treadmill.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The real cost of padel</h2>
            <p>
              Playing once a week at an average UK venue costs roughly <strong className="text-pm-text">£40-60 per month</strong> (your share of court hire). Add in equipment replacement every 12-18 months and the occasional pack of balls, and you&apos;re looking at about <strong className="text-pm-text">£60-80 per month</strong> as a regular player.
            </p>
            <p className="mt-3">
              Compare that to a gym membership (£30-50), a golf club (£100-200), or tennis at a private club (£80-150). Padel sits in a sweet spot: cheaper than most racket sports, more social than a gym, and genuinely enjoyable from session one.
            </p>
          </section>
        </div>

        {/* CTAs */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/find" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find courts near you</div>
            <p className="mt-1 text-xs text-pm-faint">{totalVenues} venues with live availability</p>
          </a>
          <a href="/gear/rackets/under-100" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Rackets under £100</div>
            <p className="mt-1 text-xs text-pm-faint">Quality gear without the premium price</p>
          </a>
        </div>
      </article>
    </main>
  );
}
