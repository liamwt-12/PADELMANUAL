import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Padel vs Pickleball — What's the Difference?",
  description: 'Padel and pickleball compared: courts, equipment, rules, cost and which one to try first. An honest breakdown for UK players.',
}

export default function PadelVsPickleballPage() {
  return (
    <main className="pb-10">
      <article className="max-w-2xl">
        <section className="pb-8 pt-6">
          <div className="label-caps">Guide</div>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Padel vs Pickleball
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            Two of the fastest-growing racket sports in the UK, often mentioned in the same breath. They&apos;re quite different in practice. Here&apos;s an honest comparison.
          </p>
        </section>

        <div className="prose-pm space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              The court
            </h2>
            <p>
              A padel court is 20m × 10m, enclosed by glass walls and metal mesh — purpose-built, expensive to construct, and dedicated to the sport. A pickleball court is 13.4m × 6.1m and can be marked out on any flat surface, including existing tennis or badminton courts. This makes pickleball far cheaper and faster to roll out, which is why it&apos;s appearing in leisure centres and village halls across the country.
            </p>
            <p>
              Padel&apos;s glass walls are fundamental to the game — you play the ball off them, creating angles and rallies that feel unlike any other racket sport. Pickleball is played on an open court with a net, more like a compact version of tennis or badminton.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Equipment
            </h2>
            <p>
              Padel uses a solid, perforated racket (no strings) and a depressurised tennis-style ball. Good rackets cost £80–£250 and last well. Pickleball uses a smaller, solid paddle and a perforated plastic ball (wiffle ball). Paddles are cheaper — decent ones start at £30–£60.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              How they play
            </h2>
            <p>
              <strong className="text-pm-text">Padel</strong> is always doubles. Rallies are longer because of the walls — the ball stays in play more. The underarm serve keeps the emphasis on tactics over power. Positioning and shot placement matter more than athleticism, which is why it suits a wide range of ages and fitness levels. Matches are competitive but social.
            </p>
            <p>
              <strong className="text-pm-text">Pickleball</strong> can be singles or doubles. The plastic ball doesn&apos;t travel as fast, and there&apos;s a &quot;kitchen&quot; zone near the net where you can&apos;t volley, which prevents the game becoming a pure smash-fest. Points are generally shorter. The learning curve is gentle — most people are playing competent rallies within 15 minutes.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Cost
            </h2>
            <p>
              Padel court hire in the UK runs £28–£44 per hour at peak times, split between four players — so roughly £7–£11 each per hour. Pickleball is often cheaper: £5–£15 per hour for court hire, sometimes included in leisure centre memberships. Equipment costs are lower for pickleball across the board.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Availability in the UK
            </h2>
            <p>
              Padel has over 500 venues across the UK, concentrated in London, Manchester, Bristol, and other major cities. Purpose-built padel centres are the norm, with indoor and outdoor options. Pickleball is available at a wider range of locations — gyms, sports halls, community centres — but fewer are dedicated facilities. Both sports are growing fast, with new courts opening monthly.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Which should you try?
            </h2>
            <p>
              Try both. They&apos;re different enough that liking one doesn&apos;t mean you won&apos;t enjoy the other. If you want longer rallies, a more tactical game, and don&apos;t mind paying a bit more for court time, start with padel. If you want something you can set up almost anywhere, play solo or in pairs, and get into quickly, pickleball is the easier entry point.
            </p>
            <p>
              Many players do both. The skills transfer reasonably well — soft hands at the net, reading angles, and court positioning are valuable in either sport.
            </p>
          </section>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/find" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find padel courts</div>
            <p className="mt-1 text-xs text-pm-faint">500+ venues across the UK</p>
          </a>
          <a href="/guides/padel-vs-tennis" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Padel vs Tennis</div>
            <p className="mt-1 text-xs text-pm-faint">How the two sports compare</p>
          </a>
        </div>
      </article>
    </main>
  )
}
