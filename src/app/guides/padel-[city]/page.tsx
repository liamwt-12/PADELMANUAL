import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSupabase } from '@/lib/supabase';
import NewsletterSignup from '@/components/NewsletterSignup';
import PlayTodayBanner from '@/components/PlayTodayBanner';
import { CITY_GUIDES, type CityGuide, type CitySearch } from './cities';

export const revalidate = 86400;

type Venue = {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  address: string | null;
  postcode: string | null;
  courts: number | null;
  indoor: boolean | null;
  playtomic_tenant_id: string | null;
  google_rating: number | null;
};

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return CITY_GUIDES.map(g => ({ city: g.slug }));
}

function findGuide(slug: string): CityGuide | undefined {
  return CITY_GUIDES.find(g => g.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const guide = findGuide(city);
  if (!guide) return { title: 'Padel guide' };
  const url = `https://www.padelmanual.com/guides/padel-${guide.slug}`;
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url,
      type: 'article',
    },
  };
}

async function fetchVenues(search: CitySearch): Promise<Venue[]> {
  const supabase = getSupabase();
  const select = 'id, name, slug, city, address, postcode, courts, indoor, playtomic_tenant_id, google_rating';

  if (search.kind === 'city') {
    const { data } = await supabase
      .from('listings')
      .select(select)
      .eq('listing_type', 'venue')
      .eq('city', search.value)
      .neq('permanently_closed', true)
      .order('courts', { ascending: false, nullsFirst: false })
      .limit(40);
    return (data ?? []) as Venue[];
  }

  if (search.kind === 'cities') {
    const { data } = await supabase
      .from('listings')
      .select(select)
      .eq('listing_type', 'venue')
      .in('city', search.values)
      .neq('permanently_closed', true)
      .order('courts', { ascending: false, nullsFirst: false })
      .limit(60);
    return (data ?? []) as Venue[];
  }

  // Area-based search: union by address terms and postcode prefixes.
  const seen = new Map<string, Venue>();

  for (const term of search.addressTerms) {
    const { data } = await supabase
      .from('listings')
      .select(select)
      .eq('listing_type', 'venue')
      .neq('permanently_closed', true)
      .or(`address.ilike.%${term}%,name.ilike.%${term}%,city.ilike.%${term}%`)
      .limit(40);
    for (const v of (data ?? []) as Venue[]) seen.set(v.id, v);
  }

  if (search.postcodePrefixes?.length) {
    for (const prefix of search.postcodePrefixes) {
      const { data } = await supabase
        .from('listings')
        .select(select)
        .eq('listing_type', 'venue')
        .neq('permanently_closed', true)
        .ilike('postcode', `${prefix}%`)
        .limit(40);
      for (const v of (data ?? []) as Venue[]) seen.set(v.id, v);
    }
  }

  return Array.from(seen.values()).sort((a, b) => (b.courts ?? 0) - (a.courts ?? 0));
}

export default async function CityGuidePage({ params }: Props) {
  const { city } = await params;
  const guide = findGuide(city);
  if (!guide) notFound();

  const venues = await fetchVenues(guide.search);
  const courtCount = venues.reduce((sum, v) => sum + (v.courts ?? 0), 0);
  const indoorCount = venues.filter(v => v.indoor === true).length;
  const liveCount = venues.filter(v => v.playtomic_tenant_id).length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.metaTitle,
    description: guide.metaDescription,
    author: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    publisher: { '@type': 'Organization', name: 'Padel Manual', url: 'https://www.padelmanual.com' },
    mainEntityOfPage: `https://www.padelmanual.com/guides/padel-${guide.slug}`,
    about: { '@type': 'Place', name: `${guide.name}, ${guide.region}` },
  };

  const nearbyGuides = guide.nearby
    .map(slug => CITY_GUIDES.find(g => g.slug === slug))
    .filter((g): g is CityGuide => Boolean(g));

  return (
    <main className="pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-2xl">
        <section className="pb-8 pt-6">
          <a href="/find" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
            ← All venues
          </a>
          <div className="label-caps mt-6">{guide.region} · City guide</div>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Padel in {guide.name}
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">{guide.hook}</p>

          {venues.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-pm-border px-4 py-2 text-pm-muted">
                {venues.length} venue{venues.length === 1 ? '' : 's'}
              </span>
              {courtCount > 0 && (
                <span className="rounded-full border border-pm-border px-4 py-2 text-pm-muted">
                  {courtCount} courts
                </span>
              )}
              {indoorCount > 0 && (
                <span className="rounded-full border border-pm-border px-4 py-2 text-pm-muted">
                  {indoorCount} indoor
                </span>
              )}
              {liveCount > 0 && (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {liveCount} with live availability
                </span>
              )}
            </div>
          )}
        </section>

        <div className="space-y-10 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              The {guide.name} padel scene
            </h2>
            <p>{guide.character}</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Where to play in {guide.name}
            </h2>
            <p>{guide.setting}</p>

            {venues.length > 0 ? (
              <div className="mt-5 space-y-3">
                {venues.slice(0, 12).map(v => (
                  <a
                    key={v.id}
                    href={v.slug ? `/${v.slug}` : '/find'}
                    className="block rounded-2xl border border-pm-border/40 bg-white p-5 hover:border-pm-accent/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-lg font-semibold tracking-tight text-pm-text">
                          {v.name}
                        </h3>
                        <div className="mt-1 text-xs text-pm-faint">
                          {v.address || v.city || guide.name}
                          {v.courts ? ` · ${v.courts} courts` : ''}
                          {v.indoor !== null ? ` · ${v.indoor ? 'Indoor' : 'Outdoor'}` : ''}
                        </div>
                      </div>
                      {v.playtomic_tenant_id && (
                        <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>
                  </a>
                ))}
                {venues.length > 12 && (
                  <a
                    href={`/find?search=${encodeURIComponent(guide.name)}`}
                    className="block text-xs text-pm-accent font-medium hover:text-pm-text transition-colors mt-2"
                  >
                    View all {venues.length} {guide.name} venues →
                  </a>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-pm-border/40 bg-pm-bg-card p-5">
                <p className="text-xs text-pm-muted">
                  We are still building out the {guide.name} listings. Use the directory below to
                  search the wider region, or set up a notification for when new venues open here.
                </p>
                <a
                  href="/find"
                  className="mt-3 inline-block text-xs font-medium text-pm-accent hover:text-pm-text transition-colors"
                >
                  Browse the full directory →
                </a>
              </div>
            )}
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Indoor or outdoor?
            </h2>
            <p>{guide.weather}</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              How to book
            </h2>
            <p>
              Most {guide.name} venues use{' '}
              <strong className="text-pm-text">Playtomic</strong> for bookings. Install the app, find
              the club, and you can have a court reserved in under a minute. A handful of clubs use
              their own booking system or ClubSpark — the venue page on Padel Manual links straight
              to whichever platform the club prefers, so you do not have to hunt for it.
            </p>
            <p className="mt-3">
              If you want to skip the search, our{' '}
              <a href="/play-today" className="text-pm-accent hover:text-pm-text transition-colors">
                Play Today
              </a>{' '}
              page pulls live availability from every Playtomic venue in the country and shows you
              what is bookable right now.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              New to padel in {guide.name}?
            </h2>
            <p>{guide.beginner}</p>
            <p className="mt-3">
              Read our{' '}
              <a
                href="/guides/how-to-start-playing-padel"
                className="text-pm-accent hover:text-pm-text transition-colors"
              >
                beginner guide
              </a>{' '}
              before your first session, and the{' '}
              <a
                href="/guides/padel-rules-beginners"
                className="text-pm-accent hover:text-pm-text transition-colors"
              >
                rules walkthrough
              </a>{' '}
              if you have never watched a match.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              The bottom line
            </h2>
            <p>{guide.closing}</p>
          </section>
        </div>

        {/* Play Today copper banner — between content and newsletter */}
        <div className="mt-12">
          <PlayTodayBanner city={guide.name} />
        </div>

        {nearbyGuides.length > 0 && (
          <section className="mt-12">
            <h3 className="font-serif text-lg font-semibold tracking-tight text-pm-text mb-3">
              Nearby city guides
            </h3>
            <div className="flex flex-wrap gap-2">
              {nearbyGuides.map(g => (
                <a
                  key={g.slug}
                  href={`/guides/padel-${g.slug}`}
                  className="rounded-full border border-pm-border px-4 py-2 text-xs text-pm-muted hover:bg-pm-bg-hover hover:text-pm-text transition-all"
                >
                  Padel in {g.name}
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12">
          <NewsletterSignup />
        </div>
      </article>
    </main>
  );
}
