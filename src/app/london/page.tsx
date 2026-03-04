import { getListingsByType } from "@/lib/db";
import { ListingCard } from "@/components/ListingCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Padel in London",
  description: "Courts, coaches, and leagues — curated. No clutter, just the best places to play and improve.",
};

export const revalidate = 3600;

export default async function London() {
  const [coaches, courts, leagues] = await Promise.all([
    getListingsByType("london", "coach"),
    getListingsByType("london", "court"),
    getListingsByType("london", "league"),
  ]);

  return (
    <main className="pb-10">
      <section className="pt-8 pb-10">
        <h1 className="font-display text-[clamp(36px,5vw,52px)] font-bold tracking-tight text-brand-black">
          Padel in London
        </h1>
        <p className="font-body text-lg text-brand-muted mt-4 max-w-2xl">
          {courts.length} courts. {coaches.length} coaches. {leagues.length} leagues. Curated. No clutter — just the best places to play and improve.
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-3">
          {[
            { title: "Courts", count: courts.length, href: "/london/courts" },
            { title: "Coaches", count: coaches.length, href: "/london/coaches" },
            { title: "Leagues", count: leagues.length, href: "/london/leagues" },
          ].map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="rounded-2xl border border-brand-ash/60 bg-[#fafaf9] p-6 hover:bg-brand-light transition-colors"
            >
              <div className="font-display text-xl font-semibold text-brand-black tracking-tight">
                {s.title}
              </div>
              <div className="font-body text-sm text-brand-pewter mt-1">
                {s.count} listed
              </div>
              <div className="font-body text-xs text-brand-pewter mt-4 font-medium tracking-wide">
                Explore →
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured courts */}
      <section className="pb-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-brand-black">
            Courts & venues
          </h2>
          <a href="/london/courts" className="font-body text-xs text-brand-pewter hover:text-brand-black transition-colors tracking-wide">
            View all {courts.length} →
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {courts.slice(0, 6).map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* Coaches */}
      <section className="pb-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-brand-black">
            Coaches
          </h2>
          <a href="/london/coaches" className="font-body text-xs text-brand-pewter hover:text-brand-black transition-colors tracking-wide">
            View all {coaches.length} →
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {coaches.slice(0, 6).map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* Leagues */}
      <section className="pb-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-brand-black">
            Leagues & social
          </h2>
          <a href="/london/leagues" className="font-body text-xs text-brand-pewter hover:text-brand-black transition-colors tracking-wide">
            View all {leagues.length} →
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {leagues.slice(0, 6).map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* Partner CTA */}
      <section className="rounded-2xl border border-brand-ash/60 bg-[#fafaf9] p-10">
        <span className="font-body text-[10px] font-semibold tracking-[0.14em] uppercase text-brand-accent">
          For coaches & clubs
        </span>
        <h3 className="font-display text-xl font-semibold text-brand-black mt-3 tracking-tight">
          Want to be listed here?
        </h3>
        <p className="font-body text-sm text-brand-muted mt-2">
          Every listing on Padel Manual is free. Want featured placement? Become a founding partner.
        </p>
        <a
          href="/partner"
          className="inline-block mt-5 font-body text-[13px] font-semibold px-6 py-3 bg-brand-black text-white rounded-full hover:opacity-90 transition-opacity"
        >
          Learn more →
        </a>
      </section>
    </main>
  );
}
