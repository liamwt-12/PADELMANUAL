import { getListingsByType } from "@/lib/db";
import { ListingGrid } from "@/components/ListingCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "London Padel Coaches",
  description: "Curated padel coaches in London. Every coach listed here passed the filter.",
};

export const revalidate = 3600;

export default async function LondonCoaches() {
  const listings = await getListingsByType("london", "coach");

  return (
    <main className="pb-10">
      <section className="pt-8 pb-8">
        <div className="font-body text-xs text-brand-pewter mb-3">
          <a href="/london" className="hover:text-brand-black transition-colors">London</a> / Coaches
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-brand-black">
          London padel coaches
        </h1>
        <p className="font-body text-brand-muted mt-4 max-w-2xl">
          {listings.length} coaches listed. If it&apos;s here, it passed the filter.
        </p>
      </section>
      <ListingGrid listings={listings} />
    </main>
  );
}
