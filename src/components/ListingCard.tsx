import type { Listing } from "@/lib/types";

const typeColors: Record<string, string> = {
  coach: "text-[#8b7355]",
  court: "text-pm-muted",
  league: "text-[#7c6f5b]",
};

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <a href={`/${listing.slug}`} className="card block">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${typeColors[listing.type] ?? "text-pm-faint"}`}>{listing.type}</span>
        {listing.featured && <span className="rounded-full bg-pm-accent/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-pm-accent">Featured</span>}
      </div>
      <div className="mt-3 font-serif text-lg font-semibold tracking-tight text-pm-text">{listing.name}</div>
      <div className="mt-1 text-[13px] text-pm-faint">{listing.area ? `${listing.area}, ` : ""}London</div>
      {listing.short_blurb && <p className="mt-4 text-[13px] leading-relaxed text-pm-muted">{listing.short_blurb}</p>}
    </a>
  );
}

export function ListingGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
    </div>
  );
}
