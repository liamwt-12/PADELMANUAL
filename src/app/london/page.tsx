import { getListingsByType } from "@/lib/db";
import type { Listing } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Padel in London",
  description: "Courts, coaches, and leagues in London — curated by Padel Manual.",
};
export const revalidate = 3600;

function Card({ listing }: { listing: Listing }) {
  return (
    <a href={`/${listing.slug}`} className="card block">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">{listing.type}</span>
        <span className="text-[10px] text-pm-faint">{listing.area ?? "London"}</span>
      </div>
      <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{listing.name}</div>
      {listing.short_blurb && <p className="mt-3 text-[13px] leading-relaxed text-pm-muted">{listing.short_blurb}</p>}
    </a>
  );
}

export default async function London() {
  const [coaches, courts, leagues] = await Promise.all([
    getListingsByType("london", "coach"),
    getListingsByType("london", "court"),
    getListingsByType("london", "league"),
  ]);

  return (
    <main className="pb-10">
      <section className="pt-8 pb-10">
        <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">Padel in London</h1>
        <p className="mt-4 text-lg text-pm-muted max-w-2xl">
          {courts.length} courts. {coaches.length} coaches. {leagues.length} leagues.
          Everything worth knowing about padel in the city, in one place.
        </p>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            { title: "Courts", count: courts.length, href: "/london/courts" },
            { title: "Coaches", count: coaches.length, href: "/london/coaches" },
            { title: "Leagues & Social", count: leagues.length, href: "/london/leagues" },
          ].map((s) => (
            <a key={s.href} href={s.href} className="card block">
              <div className="font-serif text-xl font-semibold tracking-tight">{s.title}</div>
              <div className="mt-1 text-sm text-pm-faint">{s.count} listed</div>
              <div className="mt-4 text-xs font-medium text-pm-faint">Explore →</div>
            </a>
          ))}
        </div>
      </section>

      <section className="pb-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Courts & venues</h2>
          <a href="/london/courts" className="text-xs font-medium text-pm-faint hover:text-pm-text transition-colors">View all {courts.length} →</a>
        </div>
        <div className="grid gap-3 md:grid-cols-3">{courts.slice(0, 6).map((l) => <Card key={l.id} listing={l} />)}</div>
      </section>

      <section className="pb-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Coaches</h2>
          <a href="/london/coaches" className="text-xs font-medium text-pm-faint hover:text-pm-text transition-colors">View all {coaches.length} →</a>
        </div>
        <div className="grid gap-3 md:grid-cols-3">{coaches.slice(0, 6).map((l) => <Card key={l.id} listing={l} />)}</div>
      </section>

      <section className="pb-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Leagues & social</h2>
          <a href="/london/leagues" className="text-xs font-medium text-pm-faint hover:text-pm-text transition-colors">View all {leagues.length} →</a>
        </div>
        <div className="grid gap-3 md:grid-cols-3">{leagues.slice(0, 6).map((l) => <Card key={l.id} listing={l} />)}</div>
      </section>
    </main>
  );
}
