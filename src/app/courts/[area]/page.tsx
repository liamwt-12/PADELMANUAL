import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Postcode area to friendly name mapping
const AREA_NAMES: Record<string, string> = {
  'SW': 'South West London', 'SE': 'South East London', 'N': 'North London',
  'NW': 'North West London', 'E': 'East London', 'W': 'West London',
  'EC': 'Central London (EC)', 'WC': 'Central London (WC)',
  'BR': 'Bromley', 'CR': 'Croydon', 'DA': 'Dartford', 'EN': 'Enfield',
  'HA': 'Harrow', 'IG': 'Ilford', 'KT': 'Kingston upon Thames',
  'RM': 'Romford', 'SM': 'Sutton', 'TW': 'Twickenham', 'UB': 'Uxbridge',
  'M': 'Manchester', 'OL': 'Oldham', 'SK': 'Stockport', 'WA': 'Warrington',
  'WN': 'Wigan', 'BL': 'Bolton',
  'BS': 'Bristol', 'BA': 'Bath',
  'B': 'Birmingham', 'CV': 'Coventry', 'WS': 'Walsall', 'WV': 'Wolverhampton',
  'LS': 'Leeds', 'BD': 'Bradford', 'HG': 'Harrogate', 'WF': 'Wakefield',
  'EH': 'Edinburgh', 'G': 'Glasgow',
  'NG': 'Nottingham', 'DE': 'Derby',
  'L': 'Liverpool', 'CH': 'Chester',
  'NE': 'Newcastle', 'SR': 'Sunderland', 'DH': 'Durham',
  'S': 'Sheffield', 'DN': 'Doncaster',
  'CF': 'Cardiff', 'SA': 'Swansea',
  'SO': 'Southampton', 'PO': 'Portsmouth',
  'BN': 'Brighton', 'RH': 'Redhill',
  'CB': 'Cambridge', 'OX': 'Oxford',
  'ST': 'Stoke-on-Trent', 'PR': 'Preston',
  'EX': 'Exeter', 'TQ': 'Torquay', 'PL': 'Plymouth',
  'LE': 'Leicester', 'NN': 'Northampton',
  'MK': 'Milton Keynes', 'LU': 'Luton',
  'RG': 'Reading', 'SL': 'Slough', 'GU': 'Guildford',
  'CT': 'Canterbury', 'ME': 'Medway', 'TN': 'Tunbridge Wells',
  'SS': 'Southend', 'CM': 'Chelmsford', 'CO': 'Colchester',
  'IP': 'Ipswich', 'NR': 'Norwich',
  'YO': 'York', 'HU': 'Hull',
  'PE': 'Peterborough', 'LN': 'Lincoln',
  'SN': 'Swindon', 'GL': 'Gloucester', 'HR': 'Hereford',
  'WR': 'Worcester', 'DY': 'Dudley',
  'FY': 'Blackpool', 'BB': 'Blackburn', 'LA': 'Lancaster',
  'CW': 'Crewe', 'TF': 'Telford',
  'HP': 'Hemel Hempstead', 'AL': 'St Albans', 'WD': 'Watford', 'SG': 'Stevenage',
  'AB': 'Aberdeen', 'DD': 'Dundee', 'FK': 'Falkirk', 'KY': 'Kirkcaldy',
  'PA': 'Paisley', 'TD': 'Galashiels',
  'LL': 'Llandudno', 'SY': 'Shrewsbury', 'LD': 'Llandrindod Wells',
  'NP': 'Newport', 'HR': 'Hereford',
};

type Props = { params: Promise<{ area: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  const upper = area.toUpperCase();
  const name = AREA_NAMES[upper] || upper;
  return {
    title: `Padel Courts in ${name} (${upper}) — Find & Book`,
    description: `Find padel courts in the ${upper} postcode area. ${name} venues with live availability, court counts, and booking links.`,
  };
}

export default async function PostcodeAreaPage({ params }: Props) {
  const { area } = await params;
  const upper = area.toUpperCase();
  const name = AREA_NAMES[upper] || upper;

  // Find venues where postcode starts with this area code
  const { data: venues } = await supabase
    .from('listings')
    .select('id, name, slug, lat, lng, courts, indoor, postcode, address, city, playtomic_url, playtomic_tenant_id')
    .ilike('postcode', `${upper}%`)
    .order('name');

  if (!venues || venues.length === 0) {
    notFound();
  }

  const courtCount = venues.reduce((sum, v) => sum + (v.courts || 0), 0);
  const indoorCount = venues.filter(v => v.indoor === true).length;
  const outdoorCount = venues.filter(v => v.indoor === false).length;
  const withAvailability = venues.filter(v => v.playtomic_tenant_id).length;

  return (
    <main className="pb-10">
      <section className="pt-6 pb-8">
        <a href="/find" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← All venues</a>
        <div className="label-caps mt-6">{upper} postcode area</div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">
          Padel courts in {name}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-pm-muted">
          {venues.length} padel venue{venues.length !== 1 ? 's' : ''} in the {upper} postcode area
          {courtCount > 0 ? ` with ${courtCount} courts between them` : ''}.
          {withAvailability > 0 ? ` ${withAvailability} show live court availability.` : ''}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-pm-border px-4 py-2 text-pm-muted">
            {venues.length} venue{venues.length !== 1 ? 's' : ''}
          </span>
          {courtCount > 0 && (
            <span className="rounded-full border border-pm-border px-4 py-2 text-pm-muted">{courtCount} courts</span>
          )}
          {indoorCount > 0 && (
            <span className="rounded-full border border-pm-border px-4 py-2 text-pm-muted">{indoorCount} indoor</span>
          )}
          {outdoorCount > 0 && (
            <span className="rounded-full border border-pm-border px-4 py-2 text-pm-muted">{outdoorCount} outdoor</span>
          )}
          {withAvailability > 0 && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {withAvailability} with live availability
            </span>
          )}
        </div>
      </section>

      {/* Venue list */}
      <div className="grid gap-3 md:grid-cols-2">
        {venues.map((v) => (
          <a key={v.id} href={`/${v.slug}`} className="card block">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
                {v.indoor === true ? 'Indoor' : v.indoor === false ? 'Outdoor' : ''}
                {v.courts ? `${v.indoor !== null ? ' · ' : ''}${v.courts} courts` : ''}
              </span>
              {v.playtomic_tenant_id && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              )}
            </div>
            <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{v.name}</div>
            {v.address && <p className="mt-1 text-[13px] text-pm-muted truncate">{v.address}</p>}
            {v.postcode && <p className="mt-1 text-xs text-pm-faint">{v.postcode}</p>}
          </a>
        ))}
      </div>

      {/* Map CTA */}
      <section className="mt-8 text-center">
        <a href="/find" className="btn-primary inline-block">
          View on the map →
        </a>
      </section>

      {/* Claim CTA */}
      <section className="mt-10 rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-8">
        <h3 className="font-serif text-xl font-semibold tracking-tight">Run a padel venue in {name}?</h3>
        <p className="mt-2 text-sm text-pm-muted max-w-md leading-relaxed">
          Your listing is already here. Claim it for free to update your details, add photos, and connect with local players.
        </p>
        <a href="mailto:hello@padelmanual.com?subject=Claim listing in ${upper}" className="mt-4 btn-secondary inline-block text-sm">
          Claim your listing →
        </a>
      </section>
    </main>
  );
}
