import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Padel vs Tennis — What\'s the Difference?',
  description: 'Padel vs tennis explained: court size, rules, scoring, equipment, fitness, and which one you should try. The complete guide for UK players.',
};

export default function PadelVsTennis() {
  return (
    <main className="pb-10">
      <article className="max-w-2xl">
        <section className="pb-8 pt-6">
          <div className="label-caps">Guide</div>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Padel vs Tennis
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            Everything you need to know about the differences between padel and tennis — from court size and scoring to which sport might suit you better.
          </p>
        </section>

        <div className="prose-pm space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The short version</h2>
            <p>
              Padel is played on a smaller enclosed court with glass walls. You use a solid racket (no strings) and the ball can bounce off the walls like squash. It&apos;s always played as doubles. The scoring is the same as tennis. It&apos;s easier to pick up, more social, and arguably more fun for casual players.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The court</h2>
            <p>
              A padel court is 20m x 10m — roughly a third the size of a tennis court. It&apos;s enclosed by glass walls (3m high at the back, lower at the sides) and metallic mesh fencing. The surface is usually artificial grass with sand infill, though some indoor courts use a harder surface.
            </p>
            <p className="mt-3">
              The smaller court means less running. You don&apos;t need the same level of fitness as tennis, which is one reason padel is growing so quickly among people who find tennis physically demanding.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The equipment</h2>
            <p>
              Padel rackets are solid — no strings. They&apos;re shorter than tennis rackets (roughly 45cm) with a perforated face that reduces air resistance. The ball looks like a tennis ball but has slightly less internal pressure, which makes it bounce lower and slower off the walls.
            </p>
            <p className="mt-3">
              A decent beginner padel racket costs £50-80. A good tennis racket starts around £100-150. Padel is genuinely cheaper to get into.
            </p>
            <div className="mt-4 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-4">
              <p className="text-xs font-medium text-pm-accent">Not sure what racket to get?</p>
              <a href="/quiz" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Take our 30-second racket quiz →</a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Scoring & rules</h2>
            <p>
              Identical to tennis: 15, 30, 40, deuce, advantage. Best of three sets. Tiebreaks at 6-6. The main rule differences are about serving (underarm only, below waist height) and the walls (the ball can bounce off the glass after hitting the ground, and you can play it off the walls).
            </p>
            <p className="mt-3">
              The wall play is what makes padel tactically interesting. Points last longer because defensive players can retrieve balls off the back wall that would be winners in tennis. This means rallies are longer, the game is more social, and raw power matters less than placement and patience.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Fitness & accessibility</h2>
            <p>
              Padel is genuinely easier on your body. The smaller court means less sprinting. The underarm serve removes the shoulder strain that plagues tennis players. The lighter racket and lower-pressure ball reduce arm fatigue. Most people can play a decent rally within their first session — something that takes weeks or months in tennis.
            </p>
            <p className="mt-3">
              This is why padel is growing fastest among 35-55 year olds in the UK. It&apos;s a sport you can pick up quickly, play socially, and enjoy without needing elite fitness.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Cost comparison</h2>
            <p>
              Court hire in the UK typically runs £40-60 per hour for padel (split between 4 players, so £10-15 each). Tennis courts range from free (public parks) to £20-30 per hour at private clubs.
            </p>
            <p className="mt-3">
              Per person, padel works out similarly to tennis at a private club — but you always have a social doubles game rather than hitting against a wall on your own.
            </p>
            <div className="mt-4 rounded-xl border border-pm-border/40 bg-pm-bg-card p-4">
              <p className="text-xs font-medium text-pm-text">Find courts near you</p>
              <a href="/find" className="text-xs text-pm-accent font-medium hover:text-pm-text transition-colors">Search 528 UK padel venues →</a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Social aspect</h2>
            <p>
              This is padel&apos;s biggest advantage over tennis. Because it&apos;s always doubles on a small court, you&apos;re constantly communicating with your partner. Points involve all four players. The glass walls mean spectators can watch easily. Most padel venues have a bar or social area. The culture around padel is inherently social in a way that tennis — with its quiet-please etiquette — simply isn&apos;t.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Which should you try?</h2>
            <p>
              If you want a social sport you can enjoy from day one without needing years of coaching, padel is the better choice. If you love the individual challenge and the tradition of tennis, stick with tennis. Many people play both.
            </p>
            <p className="mt-3">
              The UK now has over 500 padel venues and the number is growing fast. Most offer beginner sessions and racket hire, so you can try it without buying any equipment. Find a court near you and book a session — that&apos;s the only way to really know.
            </p>
          </section>
        </div>

        {/* CTAs */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/find" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find courts</div>
            <p className="mt-1 text-xs text-pm-faint">528 venues across the UK</p>
          </a>
          <a href="/quiz" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Racket quiz</div>
            <p className="mt-1 text-xs text-pm-faint">Find your perfect racket in 30 seconds</p>
          </a>
        </div>

        <div className="mt-6 rounded-xl border border-pm-border/40 bg-pm-bg-card p-4">
          <a href="/gear" className="text-xs text-pm-accent font-medium hover:text-pm-text transition-colors">Browse gear guides →</a>
        </div>
      </article>
    </main>
  );
}
