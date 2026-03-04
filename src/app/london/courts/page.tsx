import { getListingsByType } from "@/lib/db";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "London Padel Courts", description: "Every padel court in London worth knowing about." };
export const revalidate = 3600;
export default async function LondonCourts() {
  const listings = await getListingsByType("london", "court");
  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <a href="/london" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← London</a>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight">London courts</h1>
        <p className="mt-4 max-w-lg text-pm-muted">Every padel venue in London worth knowing about. {listings.length} and counting.</p>
      </section>
      <div className="grid gap-3 md:grid-cols-3">
        {listings.map((l) => (
          <a key={l.id} href={`/${l.slug}`} className="card block">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
              <span>{l.indoor ? "Indoor" : "Outdoor"}{l.courts_count ? ` · ${l.courts_count} courts` : ""}</span>
              <span>{l.area ?? "London"}</span>
            </div>
            <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{l.name}</div>
            {l.short_blurb && <p className="mt-3 text-[13px] leading-relaxed text-pm-muted">{l.short_blurb}</p>}
          </a>
        ))}
      </div>
    </main>
  );
}
