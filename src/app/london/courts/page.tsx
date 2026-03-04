import { getListingsByType } from "@/lib/db";
import { ListingGrid } from "@/components/ListingCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "London Padel Courts & Venues",
  description: "Every padel court and venue in London. Indoor, outdoor, pay-and-play — all in one place.",
};

export const revalidate = 3600;

export default async function LondonCourts() {
  const listings = await getListingsByType("london", "court");

  return (
    <main className="pb-10">
      <section className="pt-8 pb-8">
        <div className="font-body text-xs text-brand-pewter mb-3">
          <a href="/london" className="hover:text-brand-black transition-colors">London</a> / Courts
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-brand-black">
          London padel courts
        </h1>
        <p className="font-body text-brand-muted mt-4 max-w-2xl">
          {listings.length} venues across the capital. Indoor, outdoor, pay-and-play, members — every court worth knowing about.
        </p>
      </section>
      <ListingGrid listings={listings} />
    </main>
  );
}
