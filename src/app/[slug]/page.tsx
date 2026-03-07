import { getListingBySlug, getVenuesByCity } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Listing } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  const city = listing.city || listing.area || "UK";
  return {
    title: `${listing.name} — Padel in ${city}`,
    description: listing.short_blurb || listing.description?.slice(0, 160) || `${listing.name} — find courts, book, and play padel in ${city}.`,
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
      <div className="mt-1 text-[13px] text-pm-faint">
        {listing.city || listing.area || "UK"}
        {listing.courts ? ` · ${listing.courts} courts` : ""}
      </div>
    </a>
  );
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const city = listing.city || listing.area || null;
  const courts = listing.courts ?? listing.courts_count ?? null;
  const isVenue = listing.listing_type === "venue" || listing.type === "court";
  const isCoach = listing.listing_type === "coach" || listing.type === "coach";
  const typeLabel = isCoach ? "Coach" : isVenue ? "Court / Venue" : "Listing";

  // Related listings from same city
  const related = city ? await getVenuesByCity(city) : [];
  const others = related.filter((l) => l.slug !== slug).slice(0, 3);

  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <a href="/find" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
          ← All venues
        </a>
        <div className="label-caps mt-6">
          {typeLabel}
          {city ? ` · ${city}` : ""}
          {listing.region && !city ? ` · ${listing.region}` : ""}
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">{listing.name}</h1>
        {(listing.short_blurb || listing.address) && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pm-muted">
            {listing.short_blurb || listing.address}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {listing.booking_url && <LinkPill label="Book" href={listing.booking_url} />}
          {listing.playtomic_url && <LinkPill label="Book on Playtomic" href={listing.playtomic_url} />}
          {listing.website_url && <LinkPill label="Website" href={listing.website_url} />}
          {listing.instagram_url && <LinkPill label="Instagram" href={listing.instagram_url} />}
        </div>
      </section>

      {/* Details card */}
      <section className="rounded-3xl border border-pm-border/40 bg-pm-bg-card p-8">
        <div className="grid gap-8 md:grid-cols-4">
          {city && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Location</div>
              <div className="mt-1 font-medium">{city}</div>
              {listing.postcode && <div className="text-xs text-pm-faint mt-0.5">{listing.postcode}</div>}
            </div>
          )}
          {courts != null && courts > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Courts</div>
              <div className="mt-1 font-medium">{courts}</div>
            </div>
          )}
          {listing.indoor !== null && listing.indoor !== undefined && (
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
          {listing.booking_platform && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Booking</div>
              <div className="mt-1 font-medium capitalize">{listing.booking_platform}</div>
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

      {/* ── Claim CTA — compelling, not passive ── */}
      {!listing.claimed && (
        <section className="mt-6 rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-6 md:p-8">
          <div className="md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <h3 className="font-serif text-lg font-semibold tracking-tight">
                {isCoach ? "Is this you?" : "Is this your venue?"}
              </h3>
              <p className="mt-2 text-sm text-pm-muted leading-relaxed max-w-md">
                This is an auto-generated profile. Claim it for free to update your details, 
                or go premium to add photos, respond to reviews, and appear higher in search.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-pm-faint">
                <span>✓ Edit your profile</span>
                <span>✓ Add photos & video</span>
                <span>✓ Respond to reviews</span>
                <span>✓ View analytics</span>
              </div>
            </div>
            <div className="mt-5 md:mt-0 shrink-0 flex flex-col gap-2">
              <a
                href={`mailto:hello@padelmanual.com?subject=Claim: ${listing.name}&body=I'd like to claim the listing for ${listing.name}.`}
                className="btn-primary text-center text-sm"
              >
                Claim this listing
              </a>
              <span className="text-[11px] text-pm-faint text-center">
                Free to claim · Premium from {isCoach ? "£9" : "£29"}/mo
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── Empty sections that create urgency ── */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-pm-border/60 p-6 text-center">
          <div className="text-pm-ash text-2xl mb-2">📸</div>
          <p className="text-xs text-pm-faint">No photos yet</p>
          {!listing.claimed && (
            <p className="text-[11px] text-pm-accent mt-1">Claim this listing to add photos</p>
          )}
        </div>
        <div className="rounded-xl border border-dashed border-pm-border/60 p-6 text-center">
          <div className="text-pm-ash text-2xl mb-2">⭐</div>
          <p className="text-xs text-pm-faint">No reviews yet</p>
          <p className="text-[11px] text-pm-muted mt-1">Be the first to review</p>
        </div>
      </div>

      {/* Related */}
      {others.length > 0 && (
        <section className="mt-12">
          <h3 className="font-serif text-xl font-semibold tracking-tight mb-4">
            More venues in {city}
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            {others.map((l) => <RelatedCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}
    </main>
  );
}
