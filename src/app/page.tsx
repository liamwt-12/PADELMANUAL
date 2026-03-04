import { getAllListings } from "@/lib/db";
import { ListingCard } from "@/components/ListingCard";
import { NewsletterForm } from "@/components/NewsletterForm";

export const revalidate = 3600;

export default async function Home() {
  const all = await getAllListings("london");
  const courts = all.filter((l) => l.type === "court");
  const coaches = all.filter((l) => l.type === "coach");
  const leagues = all.filter((l) => l.type === "league");
  const spotlight = all.slice(0, 6);

  return (
    <main className="pb-8">
      {/* Hero */}
      <section className="pt-16 pb-16">
        <div className="inline-block px-3.5 py-1.5 bg-[#fafaf9] border border-brand-ash/40 rounded-full mb-7">
          <span className="font-body text-[11px] font-medium tracking-[0.1em] uppercase text-brand-pewter">
            London · {all.length} listings live
          </span>
        </div>
        <h1 className="font-display text-[clamp(48px,7vw,80px)] font-bold leading-[1.02] tracking-tight text-brand-black max-w-[720px]">
          The modern guide
          <br />
          to UK padel.
        </h1>
        <p className="font-body text-[clamp(17px,2.2vw,20px)] leading-relaxed text-brand-muted max-w-[480px] mt-6">
          Play better. Find better. Buy better.
          <br />
          Curated courts, coaches, and gear — no clutter.
        </p>
        <div className="flex gap-3 mt-10 flex-wrap">
          <a
            href="/london"
            className="font-body text-[13px] font-semibold px-7 py-3.5 bg-brand-black text-white rounded-full hover:opacity-90 transition-opacity tracking-wide"
          >
            Explore London
          </a>
          <a
            href="/weekly"
            className="font-body text-[13px] font-medium px-7 py-3.5 border border-brand-ash text-brand-muted rounded-full hover:bg-[#fafaf9] transition-colors tracking-wide"
          >
            Join the Weekly Note
          </a>
        </div>
      </section>

      {/* Pillars */}
      <section className="grid grid-cols-3 gap-px bg-brand-ash/60 rounded-2xl overflow-hidden">
        {[
          { label: "Courts", desc: `${courts.length} venues`, href: "/london/courts", accent: "bg-brand-ash" },
          { label: "Coaches", desc: `${coaches.length} coaches`, href: "/london/coaches", accent: "bg-brand-accent" },
          { label: "Leagues", desc: `${leagues.length} leagues`, href: "/london/leagues", accent: "bg-brand-pewter" },
        ].map((p) => (
          <a
            key={p.label}
            href={p.href}
            className="bg-[#fafaf9] hover:bg-brand-light transition-colors p-10"
          >
            <div className={`w-8 h-[3px] ${p.accent} rounded-full mb-5`} />
            <div className="font-display text-[22px] font-semibold text-brand-black tracking-tight">
              {p.label}
            </div>
            <div className="font-body text-sm text-brand-pewter mt-1.5">
              {p.desc}
            </div>
            <div className="font-body text-xs text-brand-ash mt-5 font-medium tracking-wide">
              Explore →
            </div>
          </a>
        ))}
      </section>

      {/* Spotlight */}
      <section className="mt-16">
        <div className="flex justify-between items-baseline mb-7">
          <div>
            <h2 className="font-display text-[28px] font-semibold text-brand-black tracking-tight">
              London spotlight
            </h2>
            <p className="font-body text-sm text-brand-pewter mt-1">
              Hand-picked for this month
            </p>
          </div>
          <a
            href="/london"
            className="font-body text-xs font-medium text-brand-pewter hover:text-brand-black transition-colors tracking-wide"
          >
            View all London →
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {spotlight.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* Gear CTA */}
      <section className="mt-16">
        <a
          href="/gear"
          className="block rounded-2xl border border-brand-ash/60 bg-[#fafaf9] hover:bg-brand-light transition-colors p-10"
        >
          <span className="font-body text-[10px] font-semibold tracking-[0.14em] uppercase text-brand-accent">
            Gear guides
          </span>
          <div className="font-display text-2xl font-semibold text-brand-black mt-3 tracking-tight">
            Only the picks worth buying.
          </div>
          <p className="font-body text-sm text-brand-muted mt-2 max-w-lg">
            Honest racket, shoe, and ball reviews from players, not brands. Every recommendation tested on London courts.
          </p>
          <div className="font-body text-xs text-brand-pewter mt-5 font-medium tracking-wide">
            Browse gear guides →
          </div>
        </a>
      </section>

      {/* Weekly Note */}
      <section className="mt-16 bg-brand-black rounded-3xl p-12 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(196,149,106,0.12)_0%,transparent_70%)]" />
        <div className="relative max-w-md">
          <span className="font-body text-[10px] font-semibold tracking-[0.14em] uppercase text-brand-accent">
            The Weekly Note
          </span>
          <h3 className="font-display text-[28px] font-semibold text-[#fafaf9] mt-4 tracking-tight leading-tight">
            One gear pick. One spotlight.
            <br />
            One event worth your time.
          </h3>
          <p className="font-body text-sm text-brand-pewter mt-4 leading-relaxed">
            A private weekly email for UK padel players. Plain text. No banners.
            No noise.
          </p>
          <div className="mt-7">
            <NewsletterForm dark />
          </div>
          <p className="font-body text-[11px] text-brand-pewter/50 mt-4">
            Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="mt-16 rounded-2xl border border-brand-ash/60 bg-[#fafaf9] p-12 flex justify-between items-center flex-wrap gap-6">
        <div className="max-w-md">
          <span className="font-body text-[10px] font-semibold tracking-[0.14em] uppercase text-brand-accent">
            For coaches & clubs
          </span>
          <h3 className="font-display text-2xl font-semibold text-brand-black mt-3 tracking-tight">
            Become a Founding Partner
          </h3>
          <p className="font-body text-sm text-brand-muted mt-2 leading-relaxed">
            Limited founding slots at a locked rate. Get found by players who
            care.
          </p>
        </div>
        <div className="flex items-baseline gap-4">
          <div className="text-right">
            <div className="font-display text-[28px] font-semibold text-brand-black">
              £399
              <span className="text-sm font-normal text-brand-pewter">/year</span>
            </div>
            <div className="font-body text-[11px] text-brand-pewter line-through">
              Future rate £699
            </div>
          </div>
          <a
            href="/partner"
            className="font-body text-[13px] font-semibold px-7 py-3.5 bg-brand-black text-white rounded-full hover:opacity-90 transition-opacity tracking-wide"
          >
            Apply now
          </a>
        </div>
      </section>
    </main>
  );
}
