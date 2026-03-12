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

/* ── Stat card ── */

function StatCard({
  label,
  value,
  subtext,
  hasUnread,
}: {
  label: string
  value: string | number
  subtext?: string
  hasUnread?: boolean
}) {
  return (
    <div
      className={`group relative rounded-2xl border bg-pm-bg-card p-8 transition-all duration-200 hover:border-pm-accent/30 ${
        hasUnread ? 'border-t-2 border-t-pm-accent border-pm-border' : 'border-pm-border'
      }`}
    >
      {/* Copper left accent on hover */}
      <div className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full bg-pm-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <p className="label-caps">{label}</p>
      <p className="mt-3 font-serif text-5xl font-bold tracking-tight text-pm-text">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtext && <p className="mt-2 text-xs text-pm-faint">{subtext}</p>}
    </div>
  )
}

/* ── Lead mini card (inline on overview) ── */

function LeadMiniCard({ lead }: { lead: Lead }) {
  return (
    <div className="rounded-xl border border-pm-border/60 bg-white p-4 min-w-[160px]">
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
      <p className="label-caps mb-4">Google Business Profile</p>

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
            <p className="font-serif text-3xl font-bold tracking-tight text-pm-text blur-[6px]">1,847</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Searches</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl font-bold tracking-tight text-pm-text blur-[6px]">312</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Directions</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl font-bold tracking-tight text-pm-text blur-[6px]">89</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Calls</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl font-bold tracking-tight text-pm-text blur-[6px]">541</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Website</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Recent leads section (full-width with inline mini cards) ── */

function RecentLeadsSection({
  leads,
  totalCount,
  unreadCount,
}: {
  leads: Lead[]
  totalCount: number
  unreadCount: number
}) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-8">
        <p className="label-caps mb-4">Player Leads</p>
        <div className="max-w-md">
          <p className="text-sm text-pm-muted leading-relaxed">
            Your first lead will appear here. Players are already finding your venue.
          </p>
          <p className="mt-2 text-xs text-pm-faint">
            When someone enquires through your listing, you&apos;ll see their name, email, and what they&apos;re interested in.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border bg-pm-bg-card p-8 ${
      unreadCount > 0 ? 'border-t-2 border-t-pm-accent border-pm-border' : 'border-pm-border'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="label-caps">Player Leads</p>
          {unreadCount > 0 && (
            <span className="text-[10px] font-medium text-pm-accent bg-pm-accent/[0.08] rounded-full px-2.5 py-0.5">
              {unreadCount} new
            </span>
          )}
        </div>
        <a
          href="/venue/dashboard/leads"
          className="text-xs text-pm-accent hover:underline font-medium"
        >
          View all {totalCount} →
        </a>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mb-1">
        {leads.map(lead => (
          <LeadMiniCard key={lead.id} lead={lead} />
        ))}
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

  useEffect(() => {
    if (!listing) return
    const supabase = createClient()

    // Fetch recent leads
    supabase
      .from('listing_leads')
      .select('*')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setLeads((data as Lead[]) || []))

    // Total count
    supabase
      .from('listing_leads')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listing.id)
      .then(({ count }) => setLeadCount(count || 0))

    // Unread count
    supabase
      .from('listing_leads')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listing.id)
      .eq('contacted', false)
      .then(({ count }) => setUnreadCount(count || 0))
  }, [listing])

  // Refresh data after Stripe upgrade
  useEffect(() => {
    if (!justUpgraded) return
    refresh()
    const timer = setTimeout(() => refresh(), 3000)
    return () => clearTimeout(timer)
  }, [justUpgraded, refresh])

  // Fetch GBP searches for the stat card
  useEffect(() => {
    if (!owner?.gbp_connected_at) return
    fetch('/api/gbp/insights')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.searches != null) setGbpSearches(data.searches) })
      .catch(() => {})
  }, [owner?.gbp_connected_at])

  const planLabel = isPremium ? 'Premium' : isTrial ? 'Trial' : 'Free plan'

  return (
    <div>
      {/* ── Hero greeting ── */}
      <div className="mb-10">
        <h1 className="font-serif text-4xl tracking-tight text-pm-text">
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

      {/* ── Upgrade success banner ── */}
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

      {/* ── GBP connected banner ── */}
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

      {/* ── Stat cards: Views + Clicks side by side ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Listing Views"
          value={listing?.view_count ?? 0}
          subtext="All time"
        />
        <StatCard
          label="Booking Clicks"
          value={listing?.click_count ?? 0}
          subtext="All time"
        />
      </div>

      {/* ── Player Leads: full-width with inline lead previews ── */}
      <div className="mb-6">
        <StatCard
          label="Player Leads"
          value={leadCount}
          subtext={unreadCount > 0 ? `${unreadCount} unread` : 'Total'}
          hasUnread={unreadCount > 0}
        />
      </div>

      {/* ── Recent leads inline ── */}
      <div className="mb-6">
        <RecentLeadsSection
          leads={leads}
          totalCount={leadCount}
          unreadCount={unreadCount}
        />
      </div>

      {/* ── Google Business Profile: full-width ── */}
      <div className="mb-6">
        {owner?.gbp_connected_at ? <GBPInsightsCard /> : <GBPConnectCard />}
      </div>

      {/* ── Court Utilisation ── */}
      {(isPremium || isTrial) && (
        <div className="mb-6">
          {listing?.playtomic_tenant_id ? (
            <CourtUtilisationCard
              tenantId={listing.playtomic_tenant_id}
              totalCourts={listing.courts ?? listing.courts_count ?? 1}
            />
          ) : (
            <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-8">
              <p className="label-caps mb-3">Court Utilisation</p>
              <p className="text-sm text-pm-muted leading-relaxed max-w-lg">
                Court utilisation data isn&apos;t available for your venue yet. If you&apos;re on Playtomic,
                add your venue URL in{' '}
                <a href="/venue/dashboard/listing" className="text-pm-accent hover:underline">Your Listing</a>{' '}
                and we&apos;ll connect it automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Listing preview ── */}
      {listing && (
        <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-8">
          <p className="label-caps mb-4">Your Listing</p>
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
      )}

      {/* ── Premium feature previews (free users only) ── */}
      {!isPremium && !isTrial && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Court Utilisation', desc: 'Live booking data from Playtomic' },
            { label: 'Weekly Report', desc: 'Monday morning stats email' },
            { label: 'Announcements', desc: 'Pin a message to your listing' },
          ].map(f => (
            <div key={f.label} className="rounded-2xl border border-pm-border/40 bg-pm-bg-card p-6 opacity-40">
              <p className="label-caps">{f.label}</p>
              <p className="mt-3 text-xs text-pm-muted">{f.desc}</p>
              <p className="mt-3 text-[10px] text-pm-accent font-medium">Premium</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
