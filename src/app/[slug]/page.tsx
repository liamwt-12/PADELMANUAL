import { getListingBySlug, getVenuesByCity } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Listing } from "@/lib/types";
import AvailabilityWidget from "@/components/AvailabilityWidget";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  const city = listing.city || listing.area || "UK";
  return {
    title: `${listing.name} — Padel in ${city}`,
    description: listing.short_blurb || listing.description?.slice(0, 160) || `${listing.name} — find courts, book, and play padel in ${city}.`,
  };
}

function LinkPill({ label, href }: { label: string; href: string }) {
  return (
    <a className="inline-block rounded-full border border-pm-border px-4 py-2 text-sm text-pm-muted hover:bg-pm-bg-hover hover:text-pm-text transition-all" href={href} target="_blank" rel="noreferrer">
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

  const related = city ? await getVenuesByCity(city) : [];
  const others = related.filter((l) => l.slug !== slug).slice(0, 3);

  // Type assertion for fields that may exist in DB but not in TS type
  const tenantId = (listing as any).playtomic_tenant_id as string | null;
  const playtomicUrl = listing.playtomic_url || null;

  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <a href="/find" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← All venues</a>
        <div className="label-caps mt-6">
          {typeLabel}{city ? ` · ${city}` : ""}{listing.region && !city ? ` · ${listing.region}` : ""}
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">{listing.name}</h1>
        {(listing.short_blurb || listing.address) && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pm-muted">{listing.short_blurb || listing.address}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {listing.booking_url && <LinkPill label="Book" href={listing.booking_url} />}
          {playtomicUrl && !listing.booking_url && <LinkPill label="Book on Playtomic" href={playtomicUrl} />}
          {listing.website_url && <LinkPill label="Website" href={listing.website_url} />}
          {listing.instagram_url && <LinkPill label="Instagram" href={listing.instagram_url} />}
        </div>
      </section>

      {/* ── Live Availability (Playtomic venues only) ── */}
      {tenantId && playtomicUrl && (
        <section className="mb-6">
          <AvailabilityWidget
            tenantId={tenantId}
            playtomicUrl={playtomicUrl}
            venueName={listing.name}
          />
        </section>
      )}

      {/* Details */}
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
          {listing.booking_platform && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Booking</div>
              <div className="mt-1 font-medium capitalize">{listing.booking_platform}</div>
            </div>
          )}
        </div>

        {listing.description && (
          <div className="mt-8 border-t border-pm-border/40 pt-8">
            <div className="max-w-2xl whitespace-pre-wrap text-sm leading-[1.8] text-pm-muted">{listing.description}</div>
          </div>
        )}
      </section>

      {/* ── What's missing — urgency to claim ── */}
      {!listing.claimed && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-dashed border-pm-border/60 p-6 text-center">
              <div className="text-pm-ash text-2xl mb-2">📸</div>
              <p className="text-xs font-medium text-pm-muted">No photos yet</p>
              <p className="text-[11px] text-pm-accent mt-1">Claim to add photos</p>
            </div>
            <div className="rounded-xl border border-dashed border-pm-border/60 p-6 text-center">
              <div className="text-pm-ash text-2xl mb-2">⭐</div>
              <p className="text-xs font-medium text-pm-muted">No reviews yet</p>
              <p className="text-[11px] text-pm-faint mt-1">Be the first to review</p>
            </div>
            <div className="rounded-xl border border-dashed border-pm-border/60 p-6 text-center">
              <div className="text-pm-ash text-2xl mb-2">📊</div>
              <p className="text-xs font-medium text-pm-muted">Analytics available</p>
              <p className="text-[11px] text-pm-accent mt-1">Claim to see visitor data</p>
            </div>
          </div>

          <section className="mt-6 rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-6 md:p-8">
            <div className="md:flex md:items-center md:justify-between md:gap-6">
              <div>
                <h3 className="font-serif text-lg font-semibold tracking-tight">
                  {isCoach ? "Is this you?" : "Is this your venue?"}
                </h3>
                <p className="mt-2 text-sm text-pm-muted leading-relaxed max-w-md">
                  This is an auto-generated profile. Claim it to update your details, add
                  photos, link your Instagram, and connect with players in your area.
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-pm-faint">
                  <span>✓ Update your info</span>
                  <span>✓ Add photos & video</span>
                  <span>✓ Link Instagram</span>
                  <span>✓ See visitor analytics</span>
                  <span>✓ Respond to reviews</span>
                </div>
              </div>
              <div className="mt-5 md:mt-0 shrink-0">
                <a
                  href={`mailto:hello@padelmanual.com?subject=Claim: ${encodeURIComponent(listing.name)}&body=Hi, I'd like to claim the listing for ${encodeURIComponent(listing.name)}.%0A%0AMy name:%0AMy role:%0A`}
                  className="btn-primary text-center text-sm block"
                >
                  Claim this listing
                </a>
                <p className="text-[11px] text-pm-faint text-center mt-2">Free · Takes 2 minutes</p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Related */}
      {others.length > 0 && (
        <section className="mt-12">
          <h3 className="font-serif text-xl font-semibold tracking-tight mb-4">More venues in {city}</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {others.map((l) => <RelatedCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}
    </main>
  );
}
