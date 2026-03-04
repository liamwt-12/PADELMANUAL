import { getListingBySlug } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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

function LinkRow({ label, href }: { label: string; href: string }) {
  return <a className="text-sm underline underline-offset-4 text-pm-muted hover:text-pm-text transition-colors" href={href} target="_blank" rel="noreferrer">{label} →</a>;
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();
  const typeLabel: Record<string, string> = { court: "Court / Venue", coach: "Coach", league: "League / Social" };

  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <div className="label-caps">{typeLabel[listing.type] ?? listing.type} · {listing.city}</div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">{listing.name}</h1>
        <p className="mt-3 max-w-2xl text-lg text-pm-muted">{listing.short_blurb ?? "Curated listing on Padel Manual."}</p>
        <div className="mt-6 flex flex-wrap gap-5">
          {listing.booking_url && <LinkRow label="Book / Enquire" href={listing.booking_url} />}
          {listing.website_url && <LinkRow label="Website" href={listing.website_url} />}
          {listing.instagram_url && <LinkRow label="Instagram" href={listing.instagram_url} />}
        </div>
      </section>

      <section className="rounded-3xl border border-pm-border/40 bg-pm-bg-card p-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Area</div>
            <div className="mt-1 font-medium">{listing.area ?? "—"}</div>
          </div>
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
        </div>
        {listing.description && (
          <div className="mt-8 border-t border-pm-border/40 pt-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">About</div>
            <div className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-pm-muted">{listing.description}</div>
          </div>
        )}
        {listing.tags && listing.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {listing.tags.map((t) => <span key={t} className="rounded-full border border-pm-border/60 bg-white px-3 py-1 text-xs text-pm-faint">{t}</span>)}
          </div>
        )}
      </section>

      {listing.tier === "standard" && (
        <section className="mt-8 rounded-2xl border border-pm-accent/20 bg-pm-accent/5 p-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-accent">Is this your listing?</div>
          <p className="mt-2 text-sm text-pm-muted">Upgrade to a Featured listing for top placement, newsletter features, and a locked founding rate of £399/year.</p>
          <a href="/partner" className="mt-4 inline-block text-sm font-medium text-pm-accent underline underline-offset-4 hover:text-pm-text">Learn about partnership →</a>
        </section>
      )}
    </main>
  );
}
