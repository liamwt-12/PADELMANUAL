import { getListingsByType } from "@/lib/db";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "London Padel Coaches", description: "Curated padel coaches in London. If it's here, it passed the filter." };
export const revalidate = 3600;
export default async function LondonCoaches() {
  const listings = await getListingsByType("london", "coach");
  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <a href="/london" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← London</a>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight">London coaches</h1>
        <p className="mt-4 max-w-lg text-pm-muted">Coaches we would recommend to a friend. {listings.length} listed.</p>
      </section>
      <div className="grid gap-3 md:grid-cols-3">
        {listings.map((l) => (
          <a key={l.id} href={`/${l.slug}`} className="card block">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">{l.area ?? "London"}</div>
            <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{l.name}</div>
            {l.short_blurb && <p className="mt-3 text-[13px] leading-relaxed text-pm-muted">{l.short_blurb}</p>}
          </a>
        ))}
      </div>
    </main>
  );
}
