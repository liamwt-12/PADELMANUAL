import type { Metadata } from 'next'
import PlayTodayBanner from '@/components/PlayTodayBanner'

export const metadata: Metadata = {
  title: 'Padel Rules for Beginners — Everything You Need to Know',
  description: 'Complete guide to padel rules for beginners. Scoring, serving, walls, faults and everything you need to play your first game.',
}

export default function PadelRulesBeginnersPage() {
  return (
    <main className="pb-10">
      <article className="max-w-2xl">
        <section className="pb-8 pt-6">
          <div className="label-caps">Guide</div>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Padel Rules for Beginners
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            Everything you need to know before your first game. Padel is easier to pick up than tennis, but the walls add a layer of tactics that keeps it interesting for years.
          </p>
        </section>

        <div className="prose-pm space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              The basics
            </h2>
            <p>
              Padel is played in doubles on a court roughly a third the size of a tennis court (20m × 10m), enclosed by glass walls and metal mesh. You use a solid, perforated racket — no strings — and a ball that looks like a tennis ball but has slightly less pressure, making it slower and easier to control.
            </p>
            <p>
              Games are played as best of three sets. Each set is won by the first pair to reach six games, with a tiebreak at 6-6. The scoring within each game is the same as tennis: 15, 30, 40, game. Deuce and advantage rules apply.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Serving
            </h2>
            <p>
              The serve must be underarm. You bounce the ball on the ground and hit it at or below waist height. The ball must land in the diagonally opposite service box — just like tennis. If it hits the net and lands in, it&apos;s a let and you serve again. Two faults and you lose the point.
            </p>
            <p>
              A key difference from tennis: after the serve bounces in the service box, it can hit the back glass wall and still be in play. However, if the serve bounces and hits the side mesh wall before the back glass, it&apos;s a fault.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              The walls — what makes padel different
            </h2>
            <p>
              After the ball bounces on the ground, it can hit any wall and remain in play. You can play the ball off the back glass or side walls, which opens up angles that don&apos;t exist in tennis. This is what makes padel tactical — and what keeps rallies going longer than you&apos;d expect.
            </p>
            <p>
              The ball must always bounce on the ground before hitting a wall on your opponent&apos;s side. You cannot volley the ball directly into a wall. However, once the ball has bounced on the ground, you can let it hit the glass behind you and then return it — even over your head.
            </p>
            <p>
              Players can also leave the court through the side openings to retrieve a ball that has gone over the glass — a spectacular play that becomes more common at higher levels.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              When you lose the point
            </h2>
            <p>You lose the point if:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>The ball bounces twice on the ground on your side</li>
              <li>You hit the ball into the net</li>
              <li>The ball hits the mesh fence on your side before bouncing (on your opponent&apos;s shot)</li>
              <li>You hit the ball and it lands outside the court without bouncing on the opponents&apos; side first</li>
              <li>The ball hits you or your partner</li>
              <li>You hit the ball before it crosses the net (reaching over)</li>
              <li>You touch the net</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Positioning and tactics
            </h2>
            <p>
              Padel is a net game. The pair that controls the net usually controls the point. After returning serve, try to move forward together — both players should be at roughly the same depth. When defending, both drop back to the baseline.
            </p>
            <p>
              Unlike tennis, power isn&apos;t everything. Placement, lobs, and patience win more points than brute force. A well-placed lob over the net player&apos;s head is one of the most effective shots in padel, especially for beginners learning the game.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              What you need to start
            </h2>
            <p>
              A racket (most venues lend them for your first session), trainers with good lateral support, and three other players. Many venues run social sessions where you can turn up solo and get matched — ideal if you&apos;re just starting out.
            </p>
            <p>
              Book a court for 90 minutes for your first session. The first 30 will be working out the walls. By the end, you&apos;ll be playing rallies and already thinking about booking the next one.
            </p>
          </section>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/find" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find courts near you</div>
            <p className="mt-1 text-xs text-pm-faint">Book your first game</p>
          </a>
          <a href="/guides/padel-vs-tennis" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Padel vs Tennis</div>
            <p className="mt-1 text-xs text-pm-faint">How the two sports compare</p>
          </a>
        </div>

        <div className="mt-12">
          <PlayTodayBanner />
        </div>
      </article>
    </main>
  )
}
