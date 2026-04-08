import type { Metadata } from 'next';
import PlayTodayBanner from '@/components/PlayTodayBanner';

export const metadata: Metadata = {
  title: 'Padel Rules — The Complete Beginner\'s Guide (2026)',
  description: 'Padel rules explained simply. Scoring, serving, walls, let calls, and everything else you need to know before your first game.',
};

export default function PadelRulesPage() {
  return (
    <main className="pb-10">
      <article className="max-w-2xl">
        <section className="pb-8 pt-6">
          <div className="label-caps">Guide</div>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">Padel rules</h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            Everything you need to know before stepping on court. Simple, no jargon, with the stuff that actually trips people up highlighted.
          </p>
        </section>

        <div className="space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The basics</h2>
            <p>Padel is played as doubles — two players per side, always. The court is 20m long and 10m wide, enclosed by glass walls and metal mesh. The surface is usually artificial grass with sand.</p>
            <p className="mt-3">Games are played as best of three sets. Each set is first to six games with a tiebreak at 6-6. Scoring within each game is identical to tennis: 15, 30, 40, deuce, advantage.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Serving</h2>
            <p>The serve must be underarm. You bounce the ball behind the service line and hit it at or below waist height. The serve goes diagonally (like tennis) and must land in the opposite service box. If it hits the net and lands in, it&apos;s a let — serve again.</p>
            <p className="mt-3">You get two serves per point. A serve that bounces in the service box and then hits the back glass wall is fine — the returner plays it off the glass. But if the serve bounces and hits the side mesh (not glass) before the returner hits it, that&apos;s a fault.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The walls — the big difference</h2>
            <p>This is what makes padel unique. After the ball bounces on your side, it can hit the glass walls and you can still play it. The ball must bounce on the ground first — you can&apos;t volley it off the wall.</p>
            <p className="mt-3">Think of it like squash: the ball bounces, hits the back glass, comes back towards you, and you play it. This is why rallies in padel last longer than tennis — defensive players can retrieve balls that would be winners in tennis.</p>
            <p className="mt-3">The metal mesh sides are different from the glass back walls. If the ball hits the mesh after bouncing, the game continues. But if the ball hits the mesh directly (without bouncing first on your side), the point is over.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Playing the ball out of the court</h2>
            <p>One of padel&apos;s most spectacular rules: if the ball bounces on your side and then goes over the glass wall (common on high lobs), you can run out of the court through the side openings and play the ball back over the wall. This is rare at beginner level but produces incredible rallies in competitive play.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Scoring summary</h2>
            <div className="rounded-2xl border border-pm-border/40 bg-pm-bg-card p-6 mt-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-pm-text font-medium">Points in a game</span><span>0, 15, 30, 40, deuce, advantage</span></div>
                <div className="border-t border-pm-border/30" />
                <div className="flex justify-between"><span className="text-pm-text font-medium">Games to win a set</span><span>6 (tiebreak at 6-6)</span></div>
                <div className="border-t border-pm-border/30" />
                <div className="flex justify-between"><span className="text-pm-text font-medium">Sets to win a match</span><span>Best of 3</span></div>
                <div className="border-t border-pm-border/30" />
                <div className="flex justify-between"><span className="text-pm-text font-medium">Serve</span><span>Underarm, below waist, 2 attempts</span></div>
                <div className="border-t border-pm-border/30" />
                <div className="flex justify-between"><span className="text-pm-text font-medium">Players</span><span>Always doubles (2v2)</span></div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Common mistakes beginners make</h2>
            <p><strong className="text-pm-text">Serving overarm:</strong> It must be underarm, below the waist. No exceptions.</p>
            <p className="mt-2"><strong className="text-pm-text">Volleying off the wall:</strong> The ball must bounce on the ground before hitting the wall. You can&apos;t play a volley that goes straight to the glass.</p>
            <p className="mt-2"><strong className="text-pm-text">Touching the net:</strong> You can&apos;t touch the net or cross to the opponents&apos; side at any point. If you do, you lose the point.</p>
            <p className="mt-2"><strong className="text-pm-text">Hitting the mesh on serve:</strong> The serve can hit the glass after bouncing but not the mesh. If it does, it&apos;s a fault.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Tips for your first game</h2>
            <p>Don&apos;t try to hit winners. Padel rewards patience and placement over power. Keep the ball in play, let the walls work for you on defence, and focus on getting to the net — that&apos;s where points are won.</p>
            <p className="mt-3">Most venues offer racket hire and beginner sessions. You don&apos;t need any equipment to try it.</p>
          </section>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/find" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find courts</div>
            <p className="mt-1 text-xs text-pm-faint">528 venues across the UK</p>
          </a>
          <a href="/guides/padel-vs-tennis" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Padel vs Tennis</div>
            <p className="mt-1 text-xs text-pm-faint">What&apos;s the difference?</p>
          </a>
        </div>

        <div className="mt-12">
          <PlayTodayBanner />
        </div>
      </article>
    </main>
  );
}
