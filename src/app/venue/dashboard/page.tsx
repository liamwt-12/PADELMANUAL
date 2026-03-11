'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDashboard } from '@/lib/hooks/useVenueOwner'
import { createClient } from '@/lib/supabase-browser'
import UpgradeButton from '@/components/UpgradeButton'

type Lead = {
  id: string
  player_name: string
  player_email: string
  interest_type: string
  contacted: boolean
  created_at: string
}

/* ── Stat card ── */

function StatCard({ label, value, subtext }: {
  label: string
  value: string | number
  subtext?: string
}) {
  return (
    <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-5">
      <p className="label-caps">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold tracking-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtext && <p className="mt-1 text-xs text-pm-faint">{subtext}</p>}
    </div>
  )
}

function StatCardCTA({ label, text, linkText }: {
  label: string
  text: string
  linkText: string
}) {
  return (
    <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-5 flex flex-col justify-between">
      <div>
        <p className="label-caps">{label}</p>
        <p className="mt-2 text-sm text-pm-muted">{text}</p>
      </div>
      <p className="mt-3 text-xs text-pm-accent font-medium">{linkText}</p>
    </div>
  )
}

/* ── GBP connect card ── */

function GBPConnectCard() {
  return (
    <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6 h-full flex flex-col">
      <p className="label-caps mb-3">Google Reviews</p>
      <h3 className="font-serif text-base font-semibold tracking-tight">
        See how players find you on Google
      </h3>
      <p className="mt-2 text-sm text-pm-muted leading-relaxed flex-1">
        Connect your Google Business Profile to see your search impressions,
        direction requests, calls, and reviews — all in one place.
      </p>
      <button className="btn-secondary text-xs mt-4 self-start">
        Connect Google Business Profile →
      </button>
    </div>
  )
}

/* ── Recent leads card ── */

function RecentLeadsCard({ leads, totalCount }: { leads: Lead[]; totalCount: number }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6 h-full">
        <p className="label-caps mb-3">Recent Leads</p>
        <p className="text-sm text-pm-muted">No leads yet.</p>
        <p className="mt-1 text-xs text-pm-faint leading-relaxed">
          Player enquiries from your listing will appear here once they start coming in.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="label-caps">Recent Leads</p>
        {totalCount > 0 && (
          <span className="text-[10px] font-medium text-pm-muted bg-pm-bg-hover rounded-full px-2 py-0.5">
            {totalCount} total
          </span>
        )}
      </div>

      <div className="space-y-3 flex-1">
        {leads.map(lead => (
          <div key={lead.id} className="flex items-start gap-2.5">
            {!lead.contacted && (
              <span className="w-1.5 h-1.5 rounded-full bg-pm-accent mt-1.5 shrink-0" />
            )}
            {lead.contacted && <span className="w-1.5 shrink-0" />}
            <div className="min-w-0">
              <p className="text-sm font-medium text-pm-text truncate">{lead.player_name}</p>
              <p className="text-xs text-pm-faint">
                {lead.interest_type !== 'general' && (
                  <span className="capitalize">{lead.interest_type}</span>
                )}
                {lead.interest_type !== 'general' && ' · '}
                {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <a
        href="/venue/dashboard/leads"
        className="text-xs text-pm-accent hover:underline mt-4 font-medium"
      >
        View all leads →
      </a>
    </div>
  )
}

/* ── Overview page ── */

export default function DashboardOverview() {
  const { listing, owner, isPremium, isTrial } = useDashboard()
  const searchParams = useSearchParams()
  const justUpgraded = searchParams.get('upgraded') === 'true'
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(justUpgraded)
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadCount, setLeadCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

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

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6">
        <p className="label-caps">Dashboard</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">
          {listing?.name || 'Your Venue'}
        </h1>
        <p className="mt-1 text-sm text-pm-muted">
          {listing?.city || 'UK'}
          {' · '}
          {isPremium ? 'Premium' : isTrial ? 'Trial' : 'Free plan'}
        </p>
      </div>

      {/* ── Upgrade success banner ── */}
      {showUpgradeBanner && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-900">Welcome to Premium!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
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

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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
        <StatCard
          label="Player Leads"
          value={leadCount}
          subtext={unreadCount > 0 ? `${unreadCount} new` : 'Total'}
        />
        {owner?.gbp_connected_at ? (
          <StatCard
            label="Google Searches"
            value="—"
            subtext="This month"
          />
        ) : (
          <StatCardCTA
            label="Google Searches"
            text="Connect to see your data"
            linkText="Connect Google →"
          />
        )}
      </div>

      {/* ── Two-column: Leads + Google ── */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <RecentLeadsCard leads={leads} totalCount={leadCount} />
        <GBPConnectCard />
      </div>

      {/* ── Listing preview ── */}
      {listing && (
        <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6">
          <p className="label-caps mb-3">Your Listing</p>
          <h3 className="font-serif text-lg font-semibold tracking-tight">{listing.name}</h3>
          {listing.short_blurb && (
            <p className="mt-1 text-sm text-pm-muted">{listing.short_blurb}</p>
          )}
          {listing.address && !listing.short_blurb && (
            <p className="mt-1 text-sm text-pm-muted">{listing.address}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={`/${listing.slug}`} className="btn-secondary text-xs">
              View live listing →
            </a>
            <a href="/venue/dashboard/listing" className="text-xs text-pm-accent hover:underline font-medium self-center">
              Edit listing
            </a>
          </div>
        </div>
      )}

      {/* ── Premium feature previews (free users only) ── */}
      {!isPremium && !isTrial && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Court Utilisation', desc: 'Live booking data from Playtomic' },
            { label: 'Weekly Report', desc: 'Monday morning stats email' },
            { label: 'Announcements', desc: 'Pin a message to your listing' },
          ].map(f => (
            <div key={f.label} className="rounded-2xl border border-pm-border/40 bg-pm-bg-card p-5 opacity-50">
              <p className="label-caps">{f.label}</p>
              <p className="mt-2 text-xs text-pm-muted">{f.desc}</p>
              <p className="mt-2 text-[10px] text-pm-accent font-medium">Premium</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
