import { getSupabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import NewsletterSignup from '@/components/NewsletterSignup';

export const metadata: Metadata = {
  title: 'How to Start Playing Padel in the UK (2026 Guide)',
  description: 'Everything you need to start playing padel in the UK: what it is, what to wear, what racket to buy, how to find a court, and what to expect in your first session.',
  alternates: { canonical: 'https://www.padelmanual.com/guides/how-to-start-playing-padel' },
  openGraph: {
    title: 'How to Start Playing Padel in the UK (2026 Guide)',
    description: 'Everything you need to start playing padel in the UK: what it is, what to wear, what racket to buy, how to find a court, and what to expect in your first session.',
    url: 'https://www.padelmanual.com/guides/how-to-start-playing-padel',
  },
};

export const revalidate = 86400;

export default async function HowToStartPage() {
  const supabase = getSupabase();
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('listing_type', 'venue');

  const venueCount = count || 500;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Start Playing Padel in the UK (2026 Guide)',
    description: 'Everything you need to start playing padel in the UK.',
    author: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    publisher: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    mainEntityOfPage: 'https://www.padelmanual.com/guides/how-to-start-playing-padel',
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
            How to start playing padel in the UK
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            Padel is the fastest-growing sport in Britain. There are now {venueCount}+ venues across the country, and most of them are designed to get beginners on court within minutes. Here is everything you need to know before your first session.
          </p>
        </section>

        <div className="space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">What padel actually is</h2>
            <p>
              Padel is a racket sport played on a court roughly a third the size of a tennis court, enclosed by glass walls and metallic mesh. It is always played as doubles — two against two. The rules are similar to tennis (same scoring: 15, 30, 40, deuce), but the serve is underarm and the ball can be played off the walls, much like squash.
            </p>
            <p className="mt-3">
              The racket is solid with no strings, shorter and lighter than a tennis racket. The ball looks like a tennis ball but has slightly less pressure, which keeps rallies going longer. The combination of a smaller court, a forgiving racket, and the wall play makes padel dramatically easier to pick up than tennis. Most people can hold a rally within their first twenty minutes.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Why padel is easier than tennis</h2>
            <p>
              Three things make the difference. First, the underarm serve: no overhead motion, no shoulder strain, and far fewer double faults. Second, the enclosed court: balls that fly past you bounce off the back wall and come back into play, which means points last longer and you spend less time chasing stray balls. Third, the court size: a padel court is 20 metres by 10 metres, which means less sprinting and a game that rewards positioning over raw athleticism.
            </p>
            <p className="mt-3">
              This is not to say padel lacks depth. At competitive level, the tactical complexity rivals tennis — wall play, the lob-and-volley game, and the bajada (a smash played off the glass) all take years to master. But the floor for enjoyment is much lower. You will have fun from game one.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">What to wear</h2>
            <p>
              Standard sportswear. Shorts or leggings, a breathable top, and court shoes with a herringbone or clay-court tread pattern. Running shoes work for your first few sessions, but they lack the lateral support you need once you start moving properly. Dedicated <a href="/gear/shoes" className="text-pm-accent hover:text-pm-text transition-colors">padel shoes</a> start around £50 and make a noticeable difference.
            </p>
            <p className="mt-3">
              Indoor courts tend to be warmer; outdoor courts in the UK can be cold from October to April, so a light jacket is worth having for the warm-up. Most venues have changing rooms and showers.
            </p>
            <div className="mt-4 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-4">
              <p className="text-xs font-medium text-pm-accent">More detail on what to bring</p>
              <a href="/guides/what-to-wear" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Read our what-to-wear guide →</a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">What racket to buy (or not)</h2>
            <p>
              Do not buy a racket before your first session. Almost every venue in the UK offers racket hire for £3–5, and many beginner sessions include it for free. Play three or four times, get a feel for the sport, then invest.
            </p>
            <p className="mt-3">
              When you are ready, look for a <strong className="text-pm-text">round-shaped racket</strong> — they have a larger sweet spot and are more forgiving on off-centre hits. A decent beginner racket costs £50–80. The Bullpadel Vertex and Head Flash are solid entry points. Avoid carbon-fibre power rackets until you have developed consistent technique.
            </p>
            <div className="mt-4 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-4">
              <p className="text-xs font-medium text-pm-accent">Find the right racket</p>
              <div className="flex gap-3 mt-2">
                <a href="/guides/best-padel-rackets-beginners-uk" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Beginner rackets →</a>
                <a href="/quiz" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Take the quiz →</a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">How to find a court</h2>
            <p>
              The UK now has {venueCount}+ padel venues, from dedicated padel centres to tennis clubs and leisure centres with a court or two. Most venues use <strong className="text-pm-text">Playtomic</strong> for online booking, which means you can see live availability and book in seconds.
            </p>
            <p className="mt-3">
              The quickest way to find a court is <a href="/play-today" className="text-pm-accent hover:text-pm-text transition-colors">Play Today</a> — our live availability tool that shows you which courts near you have slots open right now. You can also <a href="/find" className="text-pm-accent hover:text-pm-text transition-colors">browse all {venueCount} UK venues</a> by city, postcode, or train station.
            </p>
            <p className="mt-3">
              If you are in a major city, you will have multiple options. <a href="/city/london" className="text-pm-accent hover:text-pm-text transition-colors">London</a> has the most venues, but <a href="/city/manchester" className="text-pm-accent hover:text-pm-text transition-colors">Manchester</a>, <a href="/city/bristol" className="text-pm-accent hover:text-pm-text transition-colors">Bristol</a>, <a href="/city/birmingham" className="text-pm-accent hover:text-pm-text transition-colors">Birmingham</a>, and <a href="/city/edinburgh" className="text-pm-accent hover:text-pm-text transition-colors">Edinburgh</a> all have strong coverage.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">What to expect in your first session</h2>
            <p>
              Most venues run structured beginner sessions — typically 60 or 90 minutes, led by a coach, for £10–20 per person. These are the best way to start. You will learn the basic grip, the serve, forehand and backhand volleys, and how to play the ball off the back wall. By the end, you will be playing points.
            </p>
            <p className="mt-3">
              If you prefer to jump straight into a game, book a court with three friends and figure it out together. The rules are intuitive: serve underarm into the diagonal box, let the ball bounce once before returning serve, and play the ball off the walls when it suits you. The only rule that catches people out is that the ball must bounce on the ground before it hits the glass on a serve — it cannot go directly onto the wall.
            </p>
            <p className="mt-3">
              Expect to sweat. Padel is more physically demanding than it looks. A 60-minute session burns roughly 400–600 calories, depending on intensity. You will feel it in your legs and shoulders the next day.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">How to find a coach</h2>
            <p>
              Group coaching is the most cost-effective way to improve: £15–25 per person for a 60–90 minute session. Private coaching runs £40–70 per hour. Most dedicated padel venues have in-house coaches and run weekly group sessions at different levels.
            </p>
            <p className="mt-3">
              Browse venue pages on Padel Manual to see which ones offer coaching. Look for LTA-accredited coaches and venues that run regular beginner programmes rather than one-off sessions.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">How much it costs</h2>
            <p>
              Court hire runs <strong className="text-pm-text">£40–60 per hour</strong>, split four ways — so £10–15 per person. Off-peak slots (weekday daytime) are 20–30% cheaper. Add in racket hire at £3–5 and your first session costs under £20. Starter equipment (racket, shoes, balls) costs £100–150 when you are ready to invest.
            </p>
            <div className="mt-4 rounded-xl border border-pm-border/40 bg-pm-bg-card p-4">
              <a href="/guides/how-much-does-padel-cost" className="text-xs text-pm-accent font-medium hover:text-pm-text transition-colors">Full pricing breakdown →</a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Finding people to play with</h2>
            <p>
              Padel requires four players, which can feel like a barrier at first. Most venues solve this with social sessions, mixers, and Americano tournaments — formats where you turn up as an individual and get paired with others. These are typically weekly, cost £10–15, and are the single best way to meet other players at your level.
            </p>
            <p className="mt-3">
              There are also active padel communities on Facebook, WhatsApp, and Playtomic itself. Once you have played a few times, finding a regular group is straightforward. The sport is inherently social — people want to play.
            </p>
          </section>
        </div>

        {/* CTAs */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/play-today" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Play today</div>
            <p className="mt-1 text-xs text-pm-faint">Find courts with live availability</p>
          </a>
          <a href="/find" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find a venue</div>
            <p className="mt-1 text-xs text-pm-faint">{venueCount}+ venues across the UK</p>
          </a>
        </div>

        <div className="mt-10">
          <NewsletterSignup />
        </div>
      </article>
    </main>
  );
}
