import { getListingBySlug, getVenuesByCity } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Listing } from "@/lib/types";
import AvailabilityWidget from "@/components/AvailabilityWidget";
import ViewTracker from "@/components/ViewTracker";
import ClaimForm from "@/components/ClaimForm";
import GooglePlacesData from "@/components/GooglePlacesData";
import ListingSchema from "@/components/ListingSchema";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  const city = listing.city || listing.area || "UK";
  return {
    title: `${listing.name} — Padel in ${city} | Book & Play`,
    description: listing.short_blurb || listing.description?.slice(0, 160) || `${listing.name} — find courts, see live availability, read reviews, and book padel in ${city}.`,
  };
}

function LinkPill({ label, href, primary }: { label: string; href: string; primary?: boolean }) {
  return (
    <a
      className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
        primary
          ? 'bg-pm-text text-white hover:opacity-90'
          : 'border border-pm-border text-pm-muted hover:bg-pm-bg-hover hover:text-pm-text'
      }`}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {label} →
    </a>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-pm-border/40 bg-white px-4 py-3 text-center">
      <div className="font-serif text-lg font-bold text-pm-text">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">{label}</div>
    </div>
  );
}

function RelatedCard({ listing }: { listing: Listing }) {
  return (
    <a href={`/${listing.slug}`} className="card block">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
          {listing.indoor === true ? 'Indoor' : listing.indoor === false ? 'Outdoor' : ''}
          {listing.courts ? `${listing.indoor !== null ? ' · ' : ''}${listing.courts} courts` : ''}
        </span>
        {(listing as any).playtomic_tenant_id && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        )}
      </div>
      <div className="mt-2 font-serif text-base font-semibold tracking-tight">{listing.name}</div>
      <div className="mt-1 text-[13px] text-pm-faint">
        {listing.city || listing.area || "UK"}
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
  const typeLabel = isCoach ? "Coach" : isVenue ? "Venue" : "Listing";

  const related = city ? await getVenuesByCity(city) : [];
  const others = related.filter((l) => l.slug !== slug).slice(0, 4);

  const tenantId = (listing as any).playtomic_tenant_id as string | null;
  const playtomicUrl = listing.playtomic_url || null;
  const lat = (listing as any).lat;
  const lng = (listing as any).lng;

  return (
    <main className="pb-10">
      <ViewTracker slug={slug} />
      <ListingSchema name={listing.name} city={city} postcode={listing.postcode} address={listing.address} lat={lat} lng={lng} courts={courts} indoor={listing.indoor ?? null} website={listing.website_url} slug={slug} />
      {/* ── Header ── */}
      <section className="pt-6 pb-4">
        <a href="/find" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← All venues</a>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="label-caps">{typeLabel}</span>
              {city && <span className="text-[10px] text-pm-faint">· {city}</span>}
              {listing.claimed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-pm-text text-white px-2.5 py-0.5 text-[10px] font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified
                </span>
              )}
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">{listing.name}</h1>
            {(listing.short_blurb || listing.address) && (
              <p className="mt-3 max-w-xl text-base leading-relaxed text-pm-muted">{listing.short_blurb || listing.address}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          {playtomicUrl && <LinkPill label="Book on Playtomic" href={playtomicUrl} primary />}
          {listing.booking_url && !playtomicUrl && <LinkPill label="Book" href={listing.booking_url} primary />}
          {listing.website_url && <LinkPill label="Website" href={listing.website_url} />}
          {listing.instagram_url && <LinkPill label="Instagram" href={listing.instagram_url} />}
          {lat && lng && (
            <LinkPill label="Directions" href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} />
          )}
        </div>
      </section>

      {/* ── Google Places: Photos, Rating, Reviews ── */}
      {city && (
        <section className="mb-6">
          <GooglePlacesData venueName={listing.name} city={city} />
        </section>
      )}

      {/* ── Stats Pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {courts != null && courts > 0 && <StatPill label="Courts" value={String(courts)} />}
        {listing.indoor !== null && listing.indoor !== undefined && (
          <StatPill label="Setting" value={listing.indoor ? "Indoor" : "Outdoor"} />
        )}
        {listing.booking_platform && (
          <StatPill label="Booking" value={listing.booking_platform.charAt(0).toUpperCase() + listing.booking_platform.slice(1)} />
        )}
        {listing.postcode && <StatPill label="Postcode" value={listing.postcode} />}
      </div>

      {/* ── Live Availability ── */}
      {tenantId && playtomicUrl && (
        <section className="mb-6">
          <AvailabilityWidget tenantId={tenantId} playtomicUrl={playtomicUrl} venueName={listing.name} />
        </section>
      )}

      {/* ── Google Map ── */}
      {lat && lng && (
        <section className="mb-6">
          <div className="rounded-2xl overflow-hidden border border-pm-border/30">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_PLACES_API_KEY}&q=${lat},${lng}&zoom=15`}
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      )}

      {/* ── Description ── */}
      {listing.description && (
        <section className="rounded-2xl border border-pm-border/30 bg-pm-bg-card p-6 md:p-8 mb-6">
          <h2 className="font-serif text-lg font-semibold tracking-tight mb-3">About</h2>
          <div className="max-w-2xl whitespace-pre-wrap text-sm leading-[1.9] text-pm-muted">{listing.description}</div>
        </section>
      )}

      {/* ── Claim Section ── */}
      {!listing.claimed && (
        <section className="mb-6">
          <ClaimForm venueName={listing.name} venueSlug={slug} isCoach={isCoach} />
        </section>
      )}

      {/* ── Nearby Venues ── */}
      {others.length > 0 && (
        <section className="mt-8">
          <h3 className="font-serif text-xl font-semibold tracking-tight mb-4">
            More padel in {city}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map((l) => <RelatedCard key={l.id} listing={l} />)}
          </div>
          <div className="mt-4 text-center">
            <a href={`/city/${encodeURIComponent((city || '').toLowerCase())}`} className="text-xs text-pm-accent hover:text-pm-text transition-colors">
              View all venues in {city} →
            </a>
          </div>
        </section>
      )}

      {/* ── See Premium Demo ── */}
      {!listing.claimed && (
        <section className="mt-8 text-center">
          <a href="/demo" className="text-xs text-pm-faint hover:text-pm-accent transition-colors">
            See what a premium listing looks like →
          </a>
        </section>
      )}
    </main>
  );
}
