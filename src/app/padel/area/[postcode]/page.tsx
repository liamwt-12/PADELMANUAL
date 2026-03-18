import { getSupabase } from '@/lib/supabase'
import type { Metadata } from 'next'

export const revalidate = 3600

type Props = { params: Promise<{ postcode: string }> }

// London postcode area display names
const LONDON_AREAS: Record<string, string> = {
  SW: 'South West London', SE: 'South East London',
  N: 'North London', NW: 'North West London',
  E: 'East London', W: 'West London',
  EC: 'Central London (EC)', WC: 'Central London (WC)',
}

function areaLabel(code: string): string {
  const upper = code.toUpperCase()
  // Check numbered London postcodes (SW1, SE15, etc.)
  const prefix = upper.match(/^[A-Z]{1,2}/)?.[0]
  if (prefix && LONDON_AREAS[prefix]) {
    return `${upper} — ${LONDON_AREAS[prefix]}`
  }
  // Major city codes
  const cityMap: Record<string, string> = {
    M: 'Manchester', B: 'Birmingham', BS: 'Bristol', LS: 'Leeds',
    EH: 'Edinburgh', G: 'Glasgow', BN: 'Brighton', NG: 'Nottingham',
    L: 'Liverpool', CF: 'Cardiff', S: 'Sheffield', CB: 'Cambridge',
    OX: 'Oxford', BA: 'Bath', RG: 'Reading', GU: 'Guildford',
  }
  if (cityMap[upper]) return `${upper} — ${cityMap[upper]}`
  return upper
}

export async function generateStaticParams() {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('listings')
    .select('postcode')
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .not('postcode', 'is', null)

  // Extract unique postcode areas (letter prefix + optional number prefix)
  const areas = new Set<string>()
  for (const row of data || []) {
    if (!row.postcode) continue
    const pc = row.postcode.trim().toUpperCase()
    // Full area: "SW11", "SE1", "M1", "BS1" etc.
    const fullArea = pc.match(/^[A-Z]{1,2}\d{1,2}/)?.[0]
    if (fullArea) areas.add(fullArea.toLowerCase())
    // Also add the letter-only prefix: "SW", "SE", "M" etc.
    const letterPrefix = pc.match(/^[A-Z]{1,2}/)?.[0]
    if (letterPrefix) areas.add(letterPrefix.toLowerCase())
  }

  return [...areas].map(postcode => ({ postcode }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postcode } = await params
  const code = postcode.toUpperCase()
  const label = areaLabel(postcode)

  const supabase = getSupabase()
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .ilike('postcode', `${code}%`)

  return {
    title: `Padel Courts in ${code} (${count || 0} Venues)`,
    description: `Find padel courts in ${label}. ${count || 0} venues listed with court details, prices and booking links.`,
  }
}

export default async function PostcodeAreaPage({ params }: Props) {
  const { postcode } = await params
  const code = postcode.toUpperCase()
  const label = areaLabel(postcode)

  const supabase = getSupabase()
  const { data: venues } = await supabase
    .from('listings')
    .select('id, name, slug, courts, indoor, postcode, address, booking_platform, playtomic_tenant_id, premium, view_count, description')
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .ilike('postcode', `${code}%`)
    .order('name')

  if (!venues || venues.length === 0) return null

  const sorted = [...venues].sort((a, b) => {
    if (a.premium && !b.premium) return -1
    if (!a.premium && b.premium) return 1
    return (b.view_count || 0) - (a.view_count || 0)
  })

  const courtCount = venues.reduce((sum, v) => sum + (v.courts || 0), 0)

  return (
    <main className="pb-10">
      <section className="pt-6 pb-10">
        <a href="/padel" className="text-xs text-pm-faint hover:text-pm-text transition-colors">
          ← All cities
        </a>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Padel Courts in {code}
        </h1>
        <p className="mt-2 text-base text-pm-muted">
          {label} · {venues.length} venue{venues.length !== 1 ? 's' : ''}
          {courtCount > 0 && ` · ${courtCount} courts`}
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        {sorted.map(v => (
          <a key={v.id} href={`/${v.slug}`} className="card block">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
                {v.indoor === true ? 'Indoor' : v.indoor === false ? 'Outdoor' : ''}
                {v.courts ? `${v.indoor !== null ? ' · ' : ''}${v.courts} courts` : ''}
              </span>
              <div className="flex items-center gap-2">
                {v.playtomic_tenant_id && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                )}
                {v.premium && (
                  <span className="text-[10px] font-semibold text-pm-accent">Premium</span>
                )}
              </div>
            </div>
            <div className="mt-3 font-serif text-lg font-semibold tracking-tight">{v.name}</div>
            {v.description && (
              <p className="mt-2 text-[13px] leading-relaxed text-pm-muted line-clamp-2">{v.description}</p>
            )}
            {!v.description && v.address && (
              <p className="mt-1 text-[13px] text-pm-muted truncate">{v.address}</p>
            )}
            {v.postcode && (
              <p className="mt-1 text-xs text-pm-faint">{v.postcode}</p>
            )}
          </a>
        ))}
      </div>

      <section className="mt-14 pt-8 border-t border-pm-border/30">
        <p className="text-xs leading-relaxed text-pm-faint max-w-2xl">
          Padel Manual lists every padel venue in the {code} postcode area. All listings include court counts, indoor/outdoor availability, and direct booking links where available.
        </p>
      </section>
    </main>
  )
}
