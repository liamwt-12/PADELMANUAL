import { getListingBySlug, getListingsByType } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Listing } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  return {
    title: `${listing.name} — ${listing.area ?? "London"}`,
    description: listing.short_blurb ?? `${listing.name} on Padel Manual.`,
    openGraph: { title: listing.name, description: listing.short_blurb ?? undefined },
  };
}

function LinkPill({ label, href }: { label: string; href: string }) {
  return (
    <a
      className="inline-block rounded-full border border-pm-border px-4 py-2 text-sm text-pm-muted hover:bg-pm-bg-hover hover:text-pm-text transition-all"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {label} →
    </a>
  );
}

function RelatedCard({ listing }: { listing: Listing }) {
  return (
    <a href={`/${listing.slug}`} className="card block">
      <div className="font-serif text-base font-semibold tracking-tight">{listing.name}</div>
      <div className="mt-1 text-[13px] text-pm-faint">{listing.area ?? "London"}</div>
    </a>
  );
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  // Get related listings of the same type
  const related = await getListingsByType("london", listing.type);
  const others = related.filter((l) => l.slug !== slug).slice(0, 3);

  const typeLabel: Record<string, string> = { court: "Court / Venue", coach: "Coach", league: "League / Social" };

  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <a href={`/london/${listing.type === "court" ? "courts" : listing.type === "coach" ? "coaches" : "leagues"}`} className="text-xs text-pm-faint hover:text-pm-text transition-colors">
          ← All {listing.type === "court" ? "courts" : listing.type === "coach" ? "coaches" : "leagues"}
        </a>
        <div className="label-caps mt-6">{typeLabel[listing.type] ?? listing.type} · {listing.area ?? "London"}</div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">{listing.name}</h1>
        {listing.short_blurb && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pm-muted">{listing.short_blurb}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {listing.booking_url && <LinkPill label="Book" href={listing.booking_url} />}
          {listing.website_url && <LinkPill label="Website" href={listing.website_url} />}
          {listing.instagram_url && <LinkPill label="Instagram" href={listing.instagram_url} />}
        </div>
      </section>

      {/* Details card */}
      <section className="rounded-3xl border border-pm-border/40 bg-pm-bg-card p-8">
        <div className="grid gap-8 md:grid-cols-4">
          {listing.area && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Area</div>
              <div className="mt-1 font-medium">{listing.area}</div>
            </div>
          )}
          {listing.courts_count && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Courts</div>
              <div className="mt-1 font-medium">{listing.courts_count}</div>
            </div>
          )}
          {listing.indoor !== null && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Setting</div>
              <div className="mt-1 font-medium">{listing.indoor ? "Indoor" : "Outdoor"}</div>
            </div>
          )}
          {listing.price_from && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">From</div>
              <div className="mt-1 font-medium">{listing.price_from}</div>
            </div>
          )}
        </div>

        {listing.description && (
          <div className="mt-8 border-t border-pm-border/40 pt-8">
            <div className="max-w-2xl whitespace-pre-wrap text-sm leading-[1.8] text-pm-muted">
              {listing.description}
            </div>
          </div>
        )}

        {listing.tags && listing.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {listing.tags.map((t) => (
              <span key={t} className="rounded-full border border-pm-border/60 bg-white px-3 py-1 text-xs text-pm-faint">{t}</span>
            ))}
          </div>
        )}
      </section>

      {/* Soft claim — not salesy */}
      {listing.tier === "standard" && (
        <section className="mt-6 rounded-xl border border-pm-border/30 px-6 py-4">
          <p className="text-xs text-pm-faint">
            Is this your listing? <a href="mailto:hello@padelmanual.com" className="underline underline-offset-2 hover:text-pm-text transition-colors">Get in touch</a> to update your details or learn about featured placement.
          </p>
        </section>
      )}

      {/* Related */}
      {others.length > 0 && (
        <section className="mt-12">
          <h3 className="font-serif text-xl font-semibold tracking-tight mb-4">
            More {listing.type === "court" ? "courts" : listing.type === "coach" ? "coaches" : "leagues"} in London
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            {others.map((l) => <RelatedCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}
    </main>
  );
}
