import { getSupabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import NewsletterSignup from '@/components/NewsletterSignup';
import PlayTodayBanner from '@/components/PlayTodayBanner';

export const metadata: Metadata = {
  title: 'Padel vs Tennis: Which Should You Play?',
  description: 'Padel vs tennis compared: court size, rules, equipment, cost, fitness, and which is growing faster in the UK. An honest guide for 2026.',
  alternates: { canonical: 'https://www.padelmanual.com/guides/padel-vs-tennis' },
  openGraph: {
    title: 'Padel vs Tennis: Which Should You Play?',
    description: 'Padel vs tennis compared: court size, rules, equipment, cost, fitness, and which is growing faster in the UK.',
    url: 'https://www.padelmanual.com/guides/padel-vs-tennis',
  },
};

export const revalidate = 86400;

export default async function PadelVsTennisPage() {
  const supabase = getSupabase();
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('listing_type', 'venue');

  const venueCount = count || 500;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Padel vs Tennis: Which Should You Play?',
    description: 'Padel vs tennis compared for UK players in 2026.',
    author: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    publisher: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    mainEntityOfPage: 'https://www.padelmanual.com/guides/padel-vs-tennis',
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
            Padel vs tennis: which should you play?
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            Two racket sports, two very different experiences. Here is an honest comparison — court, rules, cost, fitness, and which one is growing faster in the UK.
          </p>
        </section>

        <div className="space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The short version</h2>
            <p>
              Padel is played on a smaller enclosed court with glass walls. You use a solid racket (no strings) and the ball can bounce off the walls. It is always played as doubles. The scoring is the same as tennis. Padel is easier to learn, more immediately social, and growing significantly faster. Tennis offers a deeper individual challenge and a more established competitive structure.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The court</h2>
            <p>
              A padel court is 20m x 10m — roughly a third the size of a tennis court. It is enclosed by glass walls (3m high at the back) and metallic mesh fencing. The surface is usually artificial grass with sand infill, though some indoor courts use a harder surface.
            </p>
            <p className="mt-3">
              A standard tennis court is 23.77m x 10.97m for doubles, with no walls and significantly more space to cover. The open court rewards power and movement. The enclosed padel court rewards positioning, patience, and the ability to read the ball off the glass. They are fundamentally different environments that produce fundamentally different games.
            </p>
            <p className="mt-3">
              The smaller court matters for accessibility. Less ground to cover means less sprinting, less physical strain, and fewer injuries. This is one reason padel skews older than tennis in terms of new players — the sport welcomes people who find a full tennis court physically demanding.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Rules and scoring</h2>
            <p>
              The scoring is identical: 15, 30, 40, deuce, advantage. Best of three sets. Tiebreaks at 6-6. The core rule differences:
            </p>
            <ul className="mt-3 space-y-2">
              <li><strong className="text-pm-text">Serve.</strong> Padel serves are underarm, below waist height. No overhead power serves. This removes one of tennis&apos;s biggest barriers to entry — and one of its biggest injury risks.</li>
              <li><strong className="text-pm-text">Walls.</strong> In padel, the ball can bounce off the glass walls after hitting the ground. You can play it off the walls, which means points last longer. A ball that would be a winner in tennis is often retrievable in padel.</li>
              <li><strong className="text-pm-text">Format.</strong> Padel is always doubles. No singles. This changes the social dynamic entirely — four people on court, constant communication, shared responsibility.</li>
            </ul>
            <p className="mt-3">
              The wall play is what gives padel its tactical depth. Defending off the back glass, lobbing to push opponents back, and the bajada (a smash played as the ball descends from a lob off the glass) all create a strategic game that takes years to master despite being minutes to learn.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Equipment</h2>
            <p>
              Padel rackets are solid with no strings, about 45cm long, with a perforated face. They weigh 350–380g. The ball looks like a tennis ball but has slightly less internal pressure, which slows it down and makes wall play possible.
            </p>
            <p className="mt-3">
              Tennis rackets are strung, 68–70cm long, and rely on string tension for control and power. The technique for hitting a tennis ball is significantly more demanding — string angle, wrist position, and timing all need to be precise. A padel racket is more forgiving. Hit the ball roughly in the right area and it goes roughly where you want it.
            </p>
            <p className="mt-3">
              Cost-wise: a decent beginner padel racket is £50–80. A comparable tennis racket starts at £100–150, plus stringing costs of £15–25 every few months. Padel is cheaper to equip.
            </p>
            <div className="mt-4 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-4">
              <p className="text-xs font-medium text-pm-accent">Thinking about trying padel?</p>
              <div className="flex gap-3 mt-2">
                <a href="/guides/best-padel-rackets-beginners-uk" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Beginner rackets →</a>
                <a href="/quiz" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Racket quiz →</a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Which is easier to learn?</h2>
            <p>
              Padel wins here, and it is not close. Most people can hold a rally within their first 20 minutes of padel. In tennis, developing a consistent rally takes weeks or months of practice. The underarm serve, the forgiving racket, and the enclosed court (which keeps the ball in play) all lower the barrier.
            </p>
            <p className="mt-3">
              This does not mean padel is a simple sport. The gap between a beginner and an advanced player is enormous. But the gap between &ldquo;never played&rdquo; and &ldquo;having genuine fun&rdquo; is much smaller in padel than in tennis. You enjoy the sport from session one.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Cost comparison</h2>
            <p>
              Court hire in the UK runs <strong className="text-pm-text">£40–60 per hour</strong> for padel, split four ways — so £10–15 per person. Tennis court hire ranges from free (public parks) to £20–30 per hour at private clubs. At a private tennis club, membership fees add £50–150 per month on top of court costs.
            </p>
            <p className="mt-3">
              Per person per session, padel and tennis at a private club cost roughly the same. But padel guarantees a social doubles game every time, while tennis club courts often mean hitting against one opponent or practising solo. The social return on investment in padel is higher.
            </p>
            <div className="mt-4 rounded-xl border border-pm-border/40 bg-pm-bg-card p-4">
              <a href="/guides/how-much-does-padel-cost" className="text-xs text-pm-accent font-medium hover:text-pm-text transition-colors">Full padel pricing breakdown →</a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Fitness benefits</h2>
            <p>
              Both sports provide excellent cardiovascular exercise. A 60-minute padel session burns roughly 400–600 calories; tennis is similar, sometimes higher due to the larger court. Padel places less strain on the shoulder (no overhead serve) and the knees (less sprinting, shorter distances). Tennis demands more explosive movement and upper-body power.
            </p>
            <p className="mt-3">
              For longevity, padel has an advantage. The lower-impact nature of the sport means players can compete well into their sixties and seventies. Tennis, particularly at a competitive level, takes a heavier toll on joints over time.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The social factor</h2>
            <p>
              This is padel&apos;s most significant advantage. Because it is always doubles on a small court, every point involves all four players. Communication with your partner is constant. The glass walls let spectators watch easily. Most padel venues have a bar or social area. The post-match drink is as much a part of the culture as the game itself.
            </p>
            <p className="mt-3">
              Tennis can be social too, of course — but it does not require it. Singles is the default competitive format, and the quiet-please etiquette of club tennis is the opposite of the energy on a padel court. If your primary goal is exercise plus socialising, padel delivers both more reliably.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Which is growing faster?</h2>
            <p>
              Padel, by a wide margin. The UK has gone from fewer than 100 venues in 2020 to over {venueCount} in 2026. The LTA (Lawn Tennis Association) has invested heavily in padel infrastructure, and commercial operators like Game4Padel, We Are Padel, and Padium are building dedicated centres across the country.
            </p>
            <p className="mt-3">
              Globally, padel is the fastest-growing sport in Europe. Spain has more padel courts than tennis courts. The UK is following that trajectory, roughly a decade behind. Tennis participation has been broadly flat; padel is on an exponential curve.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The verdict</h2>
            <p>
              If you want a sport you can enjoy from day one, that is inherently social, easier on your body, and growing rapidly — padel is the clear choice. If you value individual competition, a deeper technical challenge, and an established global tour structure, tennis still holds its ground.
            </p>
            <p className="mt-3">
              Many people play both. The skills overlap more than you might expect, particularly around court positioning and shot selection. But if you have to pick one to try first, padel has the lower barrier and the higher chance of hooking you from session one.
            </p>
          </section>
        </div>

        {/* CTAs */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/play-today" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find a padel court</div>
            <p className="mt-1 text-xs text-pm-faint">Live availability from {venueCount}+ UK venues</p>
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
