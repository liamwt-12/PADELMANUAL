import { getSupabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import Image from 'next/image';
import NewsletterSignup from '@/components/NewsletterSignup';
import PlayTodayBanner from '@/components/PlayTodayBanner';

export const metadata: Metadata = {
  title: 'Best Padel Rackets for Beginners in the UK (2026)',
  description: 'Honest beginner padel racket recommendations for 2026. What to look for, what to avoid, and 5 rackets worth buying — with prices and where to buy in the UK.',
  alternates: { canonical: 'https://www.padelmanual.com/guides/best-padel-rackets-beginners-uk' },
  openGraph: {
    title: 'Best Padel Rackets for Beginners in the UK (2026)',
    description: 'Honest beginner padel racket recommendations for 2026. What to look for, what to avoid, and 5 rackets worth buying.',
    url: 'https://www.padelmanual.com/guides/best-padel-rackets-beginners-uk',
  },
};

export const revalidate = 86400;

export default async function BeginnerRacketsPage() {
  const supabase = getSupabase();

  // Fetch beginner-friendly rackets: round or teardrop shape, under £120, from known brands
  const { data: allRackets } = await supabase
    .from('gear_products')
    .select('name, slug, brand, price, image, affiliate_url, source, shape, description')
    .eq('category', 'rackets')
    .in('shape', ['round', 'teardrop'])
    .order('price', { ascending: true })
    .limit(100);

  // Filter to budget-friendly beginner rackets (under £120)
  const beginnerRackets = (allRackets || [])
    .filter(r => {
      const price = parseFloat(r.price);
      return price > 0 && price <= 120;
    })
    .slice(0, 5);

  const retailerName = (source: string) => {
    if (source === 'decathlon') return 'Decathlon';
    if (source === 'express-padel') return 'Express Padel';
    return source;
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Best Padel Rackets for Beginners in the UK (2026)',
    description: 'Honest beginner padel racket recommendations for UK players.',
    author: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    publisher: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    mainEntityOfPage: 'https://www.padelmanual.com/guides/best-padel-rackets-beginners-uk',
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
            Best padel rackets for beginners in the UK
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            What to look for, what to avoid, and the rackets worth buying when you are starting out. No padding, no paid placements — just honest picks for 2026.
          </p>
        </section>

        <div className="space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Do you even need a racket yet?</h2>
            <p>
              Probably not. If you have played fewer than five sessions, hire a racket from the venue (£3–5) and spend that money on more court time instead. You do not know what you like yet. You do not know your grip style, whether you prefer control or power, or whether you will still be playing in three months. Play first, buy later.
            </p>
            <p className="mt-3">
              Once you are playing regularly — at least once a week — your own racket makes a meaningful difference. You learn its weight, its sweet spot, its balance. Consistency with the same racket accelerates improvement faster than any coaching session.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">What to look for</h2>
            <p>
              Four things matter when choosing a beginner racket:
            </p>
            <ul className="mt-3 space-y-3">
              <li>
                <strong className="text-pm-text">Shape: round.</strong> Round rackets have a central sweet spot and the most forgiveness on off-centre hits. Teardrop shapes (slightly higher sweet spot) are also acceptable for beginners. Avoid diamond shapes — they are top-heavy, designed for power, and punish poor technique.
              </li>
              <li>
                <strong className="text-pm-text">Weight: 350–370g.</strong> This range suits most adults. Under 340g and the racket feels insubstantial; over 380g and it causes fatigue. Women and juniors may prefer 340–360g. The difference of 10–15g sounds trivial but is noticeable over an hour of play.
              </li>
              <li>
                <strong className="text-pm-text">Material: fibreglass or soft EVA foam core.</strong> Fibreglass faces offer more flex and a larger effective sweet spot than carbon fibre. Carbon is stiffer and transmits more vibration to the arm — better for advanced players who need precision, worse for beginners who need comfort.
              </li>
              <li>
                <strong className="text-pm-text">Balance: low or even.</strong> A low-balance (head-light) racket is easier to manoeuvre at the net. Beginners spend most of their time at the back of the court, but learning to volley early is important, and a head-heavy racket makes volleys harder.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">What to avoid</h2>
            <p>
              <strong className="text-pm-text">Do not spend more than £120.</strong> Expensive rackets (£150+) are designed for players who have developed specific needs — more power, more spin, more control in particular zones. A beginner cannot tell the difference, and an expensive racket will not make up for inconsistent technique.
            </p>
            <p className="mt-3">
              <strong className="text-pm-text">Avoid no-name brands on Amazon.</strong> A £25 unbranded racket is a false economy. The foam degrades quickly, the face cracks, and the balance is often wrong. Stick to established padel brands: Bullpadel, Head, Adidas, Babolat, Nox, Wilson, or Kuikma (Decathlon&apos;s own brand, which is surprisingly good at the entry level).
            </p>
            <p className="mt-3">
              <strong className="text-pm-text">Avoid overgripping.</strong> Most beginners grip the racket too tightly, which causes elbow pain. If your arm hurts after playing, try a thinner grip or an overgrip rather than changing racket.
            </p>
          </section>

          {beginnerRackets.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Our picks</h2>
              <p className="mb-6">
                These are real products available from UK retailers right now, filtered for beginner-friendly shape and price point. Prices may vary.
              </p>
              <div className="space-y-4">
                {beginnerRackets.map((racket) => (
                  <div key={racket.slug} className="rounded-2xl border border-pm-border/40 bg-pm-bg-card p-5 flex gap-5">
                    {racket.image && (
                      <div className="shrink-0 w-20 h-20 relative rounded-lg overflow-hidden bg-white">
                        <Image
                          src={racket.image}
                          alt={racket.name}
                          fill
                          className="object-contain p-1"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <a href={`/gear/${racket.slug}`} className="font-serif text-base font-semibold text-pm-text hover:text-pm-accent transition-colors leading-tight">
                            {racket.name}
                          </a>
                          <p className="text-xs text-pm-faint mt-0.5">{racket.brand}{racket.shape ? ` · ${racket.shape}` : ''}</p>
                        </div>
                        <span className="text-base font-semibold text-pm-text whitespace-nowrap">£{parseFloat(racket.price).toFixed(0)}</span>
                      </div>
                      {racket.description && (
                        <p className="mt-2 text-xs text-pm-muted line-clamp-2">{racket.description}</p>
                      )}
                      <a
                        href={racket.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block rounded-full bg-pm-text px-4 py-1.5 text-xs font-semibold text-pm-bg hover:opacity-90 transition-opacity"
                      >
                        Buy from {retailerName(racket.source)} →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-pm-faint">Prices shown at time of last update. We may earn a commission from purchases made through these links.</p>
            </section>
          )}

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Where to buy in the UK</h2>
            <p>
              Two main options for buying padel rackets in the UK:
            </p>
            <ul className="mt-3 space-y-2">
              <li><strong className="text-pm-text">Express Padel</strong> — the UK&apos;s largest dedicated padel retailer. Good range from all major brands, fast UK delivery, and solid customer service. Best for mid-range and premium rackets.</li>
              <li><strong className="text-pm-text">Decathlon</strong> — their Kuikma own brand offers genuinely good beginner rackets from £30–60. Worth visiting a store to hold the rackets before buying. Best for budget-conscious beginners.</li>
            </ul>
            <p className="mt-3">
              Some padel venues also have pro shops with rackets you can try before buying — always worth asking.
            </p>
            <div className="mt-4 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-4">
              <p className="text-xs font-medium text-pm-accent">Browse all rackets</p>
              <div className="flex gap-3 mt-2">
                <a href="/gear/rackets" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">All rackets →</a>
                <a href="/gear/rackets/under-100" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Under £100 →</a>
                <a href="/quiz" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Take the quiz →</a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">When to upgrade</h2>
            <p>
              You will know. After 6–12 months of regular play, you will start to feel the limits of a beginner racket — less control on volleys, less spin on serves, or a desire for more power on smashes. At that point, you will also know whether you prefer control, power, or a balance of both, which makes choosing your next racket far easier.
            </p>
            <p className="mt-3">
              Most intermediate players settle in the £100–180 range. Jump to our <a href="/gear/best-padel-rackets-uk" className="text-pm-accent hover:text-pm-text transition-colors">complete racket guide</a> when you are ready.
            </p>
          </section>
        </div>

        {/* CTAs */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/play-today" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find courts</div>
            <p className="mt-1 text-xs text-pm-faint">Live availability near you</p>
          </a>
          <a href="/guides/how-to-start-playing-padel" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Beginner guide</div>
            <p className="mt-1 text-xs text-pm-faint">Everything you need for your first session</p>
          </a>
        </div>

        <div className="mt-12">
          <PlayTodayBanner />
        </div>

        <div className="mt-10">
          <NewsletterSignup />
        </div>
      </article>
    </main>
  );
}
