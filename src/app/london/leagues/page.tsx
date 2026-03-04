import { getListingsByType } from "@/lib/db";
import { ListingGrid } from "@/components/ListingCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "London Padel Leagues & Social Play",
  description: "Weekly leagues, social sessions, and tournaments across London padel venues.",
};

export const revalidate = 3600;

export default async function LondonLeagues() {
  const listings = await getListingsByType("london", "league");

  return (
    <main className="pb-10">
      <section className="pt-8 pb-8">
        <div className="font-body text-xs text-brand-pewter mb-3">
          <a href="/london" className="hover:text-brand-black transition-colors">London</a> / Leagues
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-brand-black">
          Leagues & social play
        </h1>
        <p className="font-body text-brand-muted mt-4 max-w-2xl">
          {listings.length} ways to play competitively or socially. Weekly leagues, tournaments, and drop-in sessions.
        </p>
      </section>
      <ListingGrid listings={listings} />
    </main>
  );
}
