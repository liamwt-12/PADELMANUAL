'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDashboard } from '@/lib/hooks/useVenueOwner'
import { createClient } from '@/lib/supabase-browser'
import UpgradeButton from '@/components/UpgradeButton'
import GBPInsightsCard from '@/components/GBPInsightsCard'
import CourtUtilisationCard from '@/components/CourtUtilisationCard'

type Lead = {
  id: string
  player_name: string
  player_email: string
  interest_type: string
  contacted: boolean
  created_at: string
}

/* ── Helpers ── */

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/* ── Section divider ── */

function Section({ label, children, className = '' }: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`mt-8 sm:mt-12 ${className}`}>
      <div className="border-t border-pm-border" />
      <p className="label-caps mt-8 mb-6">{label}</p>
      {children}
    </section>
  )
}

/* ── Lead mini card ── */

function LeadMiniCard({ lead }: { lead: Lead }) {
  return (
    <div className="rounded-xl border border-pm-border/60 bg-white p-4 min-w-[150px]">
      <div className="flex items-center gap-2 mb-1.5">
        {!lead.contacted && (
          <span className="w-1.5 h-1.5 rounded-full bg-pm-accent shrink-0" />
        )}
        <p className="text-sm font-medium text-pm-text truncate">{lead.player_name}</p>
      </div>
      {lead.interest_type !== 'general' && (
        <span className="inline-block text-[10px] uppercase tracking-wider text-pm-accent bg-pm-accent/[0.08] rounded-full px-2 py-0.5 mb-1.5">
          {lead.interest_type}
        </span>
      )}
      <p className="text-[11px] text-pm-faint">{formatDate(lead.created_at)}</p>
    </div>
  )
}

/* ── GBP connect card (aspirational, blurred placeholders) ── */

function GBPConnectCard() {
  return (
    <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-8">
      <div className="sm:flex sm:items-start sm:justify-between sm:gap-8">
        <div className="flex-1 max-w-lg">
          <h3 className="font-serif text-xl tracking-tight text-pm-text">
            See how players find you on Google
          </h3>
          <p className="mt-3 text-sm text-pm-muted leading-relaxed">
            1,847 players searched for venues like yours last month on Google.
            Connect to see your actual numbers.
          </p>
          <a
            href="/api/gbp/connect"
            className="inline-flex items-center mt-5 rounded-full bg-pm-accent text-white px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Connect Google Business Profile
          </a>
          <p className="mt-4 text-xs text-pm-faint leading-relaxed">
            Don&apos;t have a Google Business Profile yet? It&apos;s free and takes 5 minutes.{' '}
            <a
              href="https://business.google.com/create"
              target="_blank"
              rel="noreferrer"
              className="text-pm-accent hover:underline"
            >
              Set up Google Business Profile →
            </a>
          </p>
        </div>

        {/* Blurred placeholder metrics — FOMO */}
        <div className="mt-6 sm:mt-0 grid grid-cols-2 gap-x-8 gap-y-4 select-none" aria-hidden="true">
          <div className="text-center">
            <p className="font-serif text-3xl tracking-tight text-pm-text blur-[6px]">1,847</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Searches</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl tracking-tight text-pm-text blur-[6px]">312</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Directions</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl tracking-tight text-pm-text blur-[6px]">89</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Calls</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl tracking-tight text-pm-text blur-[6px]">541</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Website</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Overview page ── */

export default function DashboardOverview() {
  const { listing, owner, isPremium, isTrial, refresh } = useDashboard()
  const searchParams = useSearchParams()
  const justUpgraded = searchParams.get('upgraded') === 'true'
  const justConnectedGBP = searchParams.get('gbp') === 'connected'
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(justUpgraded)
  const [showGBPBanner, setShowGBPBanner] = useState(justConnectedGBP)
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadCount, setLeadCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [gbpSearches, setGbpSearches] = useState<number | null>(null)
  const [bestDay, setBestDay] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/venue/insights')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.bestDay) setBestDay(data.bestDay) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!listing) return
    const supabase = createClient()

    supabase
      .from('listing_leads')
      .select('*')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setLeads((data as Lead[]) || []))

    supabase
      .from('listing_leads')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listing.id)
      .then(({ count }) => setLeadCount(count || 0))

    supabase
      .from('listing_leads')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listing.id)
      .eq('contacted', false)
      .then(({ count }) => setUnreadCount(count || 0))
  }, [listing])

  useEffect(() => {
    if (!justUpgraded) return
    refresh()
    const timer = setTimeout(() => refresh(), 3000)
    return () => clearTimeout(timer)
  }, [justUpgraded, refresh])

  useEffect(() => {
    if (!owner?.gbp_connected_at) return
    fetch('/api/gbp/insights')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.searches != null) setGbpSearches(data.searches) })
      .catch(() => {})
  }, [owner?.gbp_connected_at])

  useEffect(() => {
    document.title = listing?.name
      ? `${listing.name} — Padel Manual Dashboard`
      : 'Dashboard — Padel Manual'
  }, [listing?.name])

  const planLabel = isPremium ? 'Premium' : isTrial ? 'Trial' : 'Free plan'
  const claimedAt = owner?.created_at ? new Date(owner.created_at) : null
  const isNewVenue = claimedAt ? (Date.now() - claimedAt.getTime()) < 30 * 24 * 60 * 60 * 1000 : false

  return (
    <div>
      {/* ── Hero greeting ── */}
      <div className="mb-8 sm:mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-pm-text">
          {getGreeting()}, {owner?.name?.split(' ')[0] || 'there'}.
        </h1>
        <p className="mt-2 text-lg text-pm-muted">
          {listing?.name || 'Your Venue'}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-pm-faint">{listing?.city || 'UK'}</span>
          <span className="text-pm-faint">·</span>
          <span className="flex items-center gap-1.5 text-xs text-pm-faint">
            <span className={`w-1.5 h-1.5 rounded-full ${
              isPremium ? 'bg-pm-accent' : isTrial ? 'bg-amber-400' : 'bg-pm-ash'
            }`} />
            {planLabel}
          </span>
        </div>
      </div>

      {/* ── Banners ── */}
      {showUpgradeBanner && (
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-900">Welcome to Premium.</p>
            <p className="text-xs text-emerald-700 mt-1">
              Your subscription is active. Full analytics, leads, and Google insights are now unlocked.
            </p>
          </div>
          <button
            onClick={() => setShowUpgradeBanner(false)}
            className="text-emerald-400 hover:text-emerald-600 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {showGBPBanner && (
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-900">Google Business Profile connected.</p>
            <p className="text-xs text-emerald-700 mt-1">
              Your search impressions, direction requests, and call data are now visible below.
            </p>
          </div>
          <button
            onClick={() => setShowGBPBanner(false)}
            className="text-emerald-400 hover:text-emerald-600 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── LISTING PERFORMANCE ── */}
      <Section label="Listing Performance">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-serif text-6xl tracking-tight text-pm-text">
              {(listing?.view_count ?? 0).toLocaleString()}
            </p>
            <p className="label-caps text-pm-faint mt-2">Listing Views</p>
            <p className="text-xs text-pm-faint mt-1">All time</p>
            {(listing?.view_count ?? 0) === 0 && isNewVenue && (
              <p className="text-xs text-pm-muted mt-2 leading-relaxed max-w-[200px]">
                Your listing went live recently. Views will build as players discover you.
              </p>
            )}
          </div>
          <div>
            <p className="font-serif text-6xl tracking-tight text-pm-text">
              {(listing?.click_count ?? 0).toLocaleString()}
            </p>
            <p className="label-caps text-pm-faint mt-2">Booking Clicks</p>
            <p className="text-xs text-pm-faint mt-1">All time</p>
            {(listing?.click_count ?? 0) === 0 && isNewVenue && (
              <p className="text-xs text-pm-muted mt-2 leading-relaxed max-w-[200px]">
                Make sure your booking URL is set in{' '}
                <a href="/venue/dashboard/listing" className="text-pm-accent hover:underline">Your Listing</a>.
              </p>
            )}
          </div>
        </div>
        {bestDay && (
          <p className="mt-6 text-sm text-pm-muted italic">
            Your listing gets the most enquiries on {bestDay}.
          </p>
        )}
      </Section>

      {/* ── PLAYER LEADS ── */}
      <Section label="Player Leads">
        {/* Big number */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3">
            <p className="font-serif text-6xl tracking-tight text-pm-text">
              {leadCount.toLocaleString()}
            </p>
            {unreadCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-pm-accent shrink-0" />
            )}
          </div>
          <p className="text-sm text-pm-muted mt-2">
            {unreadCount > 0
              ? `${unreadCount} new enquir${unreadCount === 1 ? 'y' : 'ies'}`
              : 'Total'
            }
          </p>
        </div>

        {/* Inline lead cards or empty state */}
        {leads.length > 0 ? (
          <div>
            <div className="flex flex-wrap gap-3">
              {leads.map(lead => (
                <LeadMiniCard key={lead.id} lead={lead} />
              ))}
            </div>
            <a
              href="/venue/dashboard/leads"
              className="inline-block mt-5 text-xs text-pm-accent hover:underline font-medium"
            >
              View all {leadCount} leads →
            </a>
          </div>
        ) : (
          <div>
            <p className="text-sm text-pm-muted leading-relaxed">
              No enquiries yet. Players can message you directly from your listing page.
            </p>
            {listing && (
              <a
                href={`/${listing.slug}`}
                className="inline-block mt-3 text-xs text-pm-accent hover:underline font-medium"
              >
                View your listing →
              </a>
            )}
          </div>
        )}
      </Section>

      {/* ── GOOGLE BUSINESS PROFILE ── */}
      <Section label="Google Business Profile">
        {owner?.gbp_connected_at ? <GBPInsightsCard /> : <GBPConnectCard />}
      </Section>

      {/* ── COURT UTILISATION ── */}
      {(isPremium || isTrial) && (
        <Section label="Court Utilisation">
          {listing?.playtomic_tenant_id ? (
            <CourtUtilisationCard
              tenantId={listing.playtomic_tenant_id}
              totalCourts={listing.courts ?? listing.courts_count ?? 1}
            />
          ) : (
            <p className="text-sm text-pm-muted leading-relaxed max-w-lg">
              Court utilisation data isn&apos;t available for your venue yet. If you&apos;re on Playtomic,
              add your venue URL in{' '}
              <a href="/venue/dashboard/listing" className="text-pm-accent hover:underline">Your Listing</a>{' '}
              and we&apos;ll connect it automatically.
            </p>
          )}
        </Section>
      )}

      {/* ── YOUR LISTING ── */}
      {listing && (
        <Section label="Your Listing">
          <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-8">
            <div className="sm:flex sm:items-start sm:justify-between sm:gap-6">
              <div className="flex-1">
                <h3 className="font-serif text-xl tracking-tight">{listing.name}</h3>
                {listing.short_blurb && (
                  <p className="mt-1.5 text-sm text-pm-muted leading-relaxed">{listing.short_blurb}</p>
                )}
                {listing.address && !listing.short_blurb && (
                  <p className="mt-1.5 text-sm text-pm-muted">{listing.address}</p>
                )}
              </div>
              <div className="flex items-center gap-4 mt-4 sm:mt-0 shrink-0">
                <a href={`/${listing.slug}`} className="btn-secondary text-xs">
                  View live listing →
                </a>
                <a
                  href="/venue/dashboard/listing"
                  className="text-xs text-pm-accent hover:underline font-medium"
                >
                  Edit
                </a>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ── Premium feature previews (free users only) ── */}
      {!isPremium && !isTrial && (
        <div className="mt-8 sm:mt-12">
          <div className="border-t border-pm-border" />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Court Utilisation', desc: 'Live booking data from Playtomic' },
              { label: 'Weekly Report', desc: 'Monday morning stats email' },
              { label: 'Announcements', desc: 'Pin a message to your listing' },
            ].map(f => (
              <div key={f.label} className="opacity-40">
                <p className="label-caps">{f.label}</p>
                <p className="mt-2 text-xs text-pm-muted">{f.desc}</p>
                <p className="mt-2 text-[10px] text-pm-accent font-medium">Premium</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
