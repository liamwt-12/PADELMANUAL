import { getAllListings } from "@/lib/db";
import { gearItems } from "@/lib/gear";
import type { Listing } from "@/lib/types";

export const revalidate = 3600;

function CourtCard({ listing }: { listing: Listing }) {
  return (
    <a href={`/${listing.slug}`} className="card block">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
          {listing.indoor ? "Indoor" : "Outdoor"}{listing.courts_count ? ` · ${listing.courts_count} courts` : ""}
        </span>
        <span className="text-[10px] font-medium text-pm-faint">{listing.area}</span>
      </div>
      <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{listing.name}</div>
      {listing.short_blurb && (
        <p className="mt-3 text-[13px] leading-relaxed text-pm-muted">{listing.short_blurb}</p>
      )}
    </a>
  );
}

function CoachCard({ listing }: { listing: Listing }) {
  return (
    <a href={`/${listing.slug}`} className="card block">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
        {listing.area ?? "London"}
      </div>
      <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{listing.name}</div>
      {listing.short_blurb && (
        <p className="mt-3 text-[13px] leading-relaxed text-pm-muted">{listing.short_blurb}</p>
      )}
    </a>
  );
}

export default async function Home() {
  const all = await getAllListings("london");
  const courts = all.filter((l) => l.type === "court");
  const coaches = all.filter((l) => l.type === "coach");
  const leagues = all.filter((l) => l.type === "league");

  // Pick a featured coach for the spotlight
  const spotlightCoach = coaches[0];
  // Pick interesting courts from different areas
  const spotlightCourts = courts.slice(0, 4);
  // Pick a gear item for the weekly pick
  const gearPick = gearItems[0]?.products[0];

  return (
    <main className="pb-8">
      {/* Hero — editorial, not salesy */}
      <section className="pt-12 pb-16">
        <h1 className="max-w-[720px] font-serif text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
          The modern guide<br />to UK padel.
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-pm-muted md:text-xl">
          Courts, coaches, gear, and leagues — curated for players who
          want to find the good stuff without wading through noise.
        </p>
        <div className="mt-8 flex flex-wrap gap-6 text-sm">
          <a href="/london/courts" className="font-medium text-pm-text underline underline-offset-4 decoration-pm-accent hover:decoration-pm-text transition-colors">
            {courts.length} courts in London →
          </a>
          <a href="/london/coaches" className="font-medium text-pm-muted underline underline-offset-4 decoration-pm-border hover:decoration-pm-text hover:text-pm-text transition-colors">
            {coaches.length} coaches →
          </a>
          <a href="/gear" className="font-medium text-pm-muted underline underline-offset-4 decoration-pm-border hover:decoration-pm-text hover:text-pm-text transition-colors">
            Gear guides →
          </a>
        </div>
      </section>

      {/* This week's pick — editorial voice */}
      {gearPick && (
        <section className="rounded-2xl border border-pm-border/60 bg-pm-bg-card p-8 md:p-10">
          <div className="label-caps">Gear pick of the week</div>
          <div className="mt-4 md:flex md:items-start md:justify-between md:gap-8">
            <div className="max-w-lg">
              <h2 className="font-serif text-2xl font-semibold tracking-tight">
                {gearPick.name}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-pm-muted">
                {gearPick.verdict}
              </p>
              <p className="mt-2 text-sm text-pm-faint">
                Best for: {gearPick.bestFor}
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:text-right shrink-0">
              <div className="text-lg font-semibold text-pm-accent">{gearPick.price}</div>
              <a
                href={gearPick.amazonUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-2 inline-block text-xs font-medium text-pm-muted underline underline-offset-4 hover:text-pm-text transition-colors"
              >
                View on Amazon →
              </a>
              <div className="mt-3">
                <a href="/gear/best-padel-rackets-uk" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
                  Read the full racket guide →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Where to play */}
      <section className="mt-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight">Where to play in London</h2>
            <p className="mt-1 text-sm text-pm-faint">{courts.length} venues and counting</p>
          </div>
          <a href="/london/courts" className="text-xs font-medium text-pm-faint hover:text-pm-text transition-colors">
            View all courts →
          </a>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {spotlightCourts.map((l) => <CourtCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* Coach spotlight */}
      {spotlightCoach && (
        <section className="mt-14">
          <div className="label-caps mb-4">Coach spotlight</div>
          <a href={`/${spotlightCoach.slug}`} className="block rounded-2xl border border-pm-border/60 bg-pm-bg-card p-8 hover:bg-pm-bg-hover transition-colors">
            <h2 className="font-serif text-2xl font-semibold tracking-tight">{spotlightCoach.name}</h2>
            <div className="mt-1 text-sm text-pm-faint">{spotlightCoach.area ?? "London"}</div>
            {spotlightCoach.description ? (
              <p className="mt-4 text-sm leading-relaxed text-pm-muted max-w-2xl">
                {spotlightCoach.description.slice(0, 280)}{spotlightCoach.description.length > 280 ? "..." : ""}
              </p>
            ) : spotlightCoach.short_blurb ? (
              <p className="mt-4 text-sm leading-relaxed text-pm-muted max-w-2xl">{spotlightCoach.short_blurb}</p>
            ) : null}
            <div className="mt-4 text-xs font-medium text-pm-accent">Read full profile →</div>
          </a>
          <div className="mt-3 text-right">
            <a href="/london/coaches" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
              View all {coaches.length} coaches →
            </a>
          </div>
        </section>
      )}

      {/* Gear guides */}
      <section className="mt-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight">Gear guides</h2>
            <p className="mt-1 text-sm text-pm-faint">Honest reviews, not sponsored content</p>
          </div>
          <a href="/gear" className="text-xs font-medium text-pm-faint hover:text-pm-text transition-colors">
            All guides →
          </a>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {gearItems.map((g) => (
            <a key={g.slug} href={`/gear/${g.slug}`} className="card block">
              <div className="label-caps">{g.category}</div>
              <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{g.title}</div>
              <p className="mt-2 text-[13px] text-pm-muted">{g.headline}</p>
              <div className="mt-4 text-xs font-medium text-pm-faint">Read guide →</div>
            </a>
          ))}
        </div>
      </section>

      {/* Leagues & social */}
      {leagues.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight">Leagues & social</h2>
              <p className="mt-1 text-sm text-pm-faint">Show up, play, meet people</p>
            </div>
            <a href="/london/leagues" className="text-xs font-medium text-pm-faint hover:text-pm-text transition-colors">
              View all →
            </a>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {leagues.slice(0, 3).map((l) => (
              <a key={l.id} href={`/${l.slug}`} className="card block">
                <div className="font-serif text-base font-semibold tracking-tight">{l.name}</div>
                {l.short_blurb && <p className="mt-2 text-[13px] leading-relaxed text-pm-muted">{l.short_blurb}</p>}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter — earned, at the bottom */}
      <section className="mt-16 rounded-3xl bg-pm-text p-10 md:p-14">
        <div className="label-caps !text-pm-accent">The Weekly Note</div>
        <h3 className="mt-4 max-w-md font-serif text-2xl font-semibold leading-tight text-pm-bg md:text-3xl">
          One gear pick. One spotlight.<br />One thing worth knowing.
        </h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-pm-faint">
          A short weekly email for London padel players. Plain text. No banners.
          No noise. Just the good stuff.
        </p>
        <form
          action="https://buttondown.com/api/emails/embed-subscribe/padelmanual"
          method="post"
          target="popupwindow"
          className="mt-7 max-w-md"
        >
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-pm-accent/40"
            />
            <button
              type="submit"
              className="rounded-full bg-pm-bg px-6 py-3 text-sm font-semibold text-pm-text hover:opacity-90 transition-opacity"
            >
              Subscribe
            </button>
          </div>
        </form>
        <p className="mt-3 text-[11px] text-white/20">Free. Unsubscribe anytime.</p>
      </section>
    </main>
  );
}
