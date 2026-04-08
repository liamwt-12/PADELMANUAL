'use client'

import { useEffect, useState } from 'react'
import { useDashboard } from '@/lib/hooks/useVenueOwner'
import { createClient } from '@/lib/supabase-browser'

type VenueStats = {
  listing_id: string
  lead_count: number
}

export default function AllVenuesPage() {
  const { allVenues, setActiveVenueId, owner } = useDashboard()
  const [leadStats, setLeadStats] = useState<Record<string, number>>({})

  useEffect(() => {
    document.title = 'All Venues — Padel Manual Dashboard'
  }, [])

  // Fetch lead counts for all venues
  useEffect(() => {
    if (allVenues.length === 0) return
    const supabase = createClient()
    const ids = allVenues.map(v => v.listing_id)

    supabase
      .from('listing_leads')
      .select('listing_id', { count: 'exact' })
      .in('listing_id', ids)
      .then(({ data }) => {
        if (!data) return
        const counts: Record<string, number> = {}
        for (const row of data) {
          counts[row.listing_id] = (counts[row.listing_id] || 0) + 1
        }
        setLeadStats(counts)
      })
  }, [allVenues])

  const premiumCount = allVenues.filter(v => v.subscription_status === 'premium').length
  const trialCount = allVenues.filter(v => v.subscription_status === 'trial').length
  const freeCount = allVenues.filter(v => v.subscription_status === 'free').length
  const hasTrialVenues = trialCount > 0

  const totalViews = allVenues.reduce((sum, v) => sum + v.view_count, 0)
  const totalClicks = allVenues.reduce((sum, v) => sum + v.click_count, 0)
  const totalLeads = Object.values(leadStats).reduce((sum, c) => sum + c, 0)
  const hasAnyData = totalViews > 0 || totalClicks > 0 || totalLeads > 0

  function handleManage(listingId: string) {
    setActiveVenueId(listingId)
    window.location.href = '/venue/dashboard'
  }

  if (allVenues.length <= 1) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-pm-muted">You have one venue. Nothing to see here.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <p className="label-caps">All Venues</p>
        <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight">
          All Venues
        </h1>
        <p className="mt-2 text-sm text-pm-muted">
          {allVenues.length} venue{allVenues.length !== 1 ? 's' : ''}
          {premiumCount > 0 && <> &middot; {premiumCount} premium</>}
          {trialCount > 0 && <> &middot; {trialCount} trial</>}
          {freeCount > 0 && <> &middot; {freeCount} free</>}
        </p>
      </div>

      {/* Trial welcome message */}
      {hasTrialVenues && (
        <div className="mb-8 rounded-2xl border border-pm-accent/30 bg-pm-accent/[0.04] p-5 md:p-6">
          <div className="flex items-start gap-3">
            <span className="relative mt-2 flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pm-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pm-accent" />
            </span>
            <div>
              <p className="font-serif text-base font-semibold tracking-tight text-pm-text">
                Welcome to your 30-day trial.
              </p>
              <p className="mt-1 text-sm text-pm-muted leading-relaxed">
                Your venues are live and being found by players — data builds over the coming days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Venue rows */}
      <div className="border-t border-pm-border">
        {allVenues.map(v => {
          const leads = leadStats[v.listing_id] || 0
          const status = v.subscription_status
          const rowHasData = v.view_count > 0 || v.click_count > 0 || leads > 0

          const statusLabel = status === 'premium' ? 'Premium' : status === 'trial' ? 'Trial' : 'Free'
          const statusActive = status === 'premium' || status === 'trial'

          return (
            <div
              key={v.listing_id}
              className="flex items-center justify-between gap-4 py-5 border-b border-pm-border/60"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <p className="text-sm font-medium text-pm-text truncate">
                    {v.listing_name}
                  </p>
                  {v.listing_city && (
                    <span className="text-xs text-pm-faint shrink-0">{v.listing_city}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1.5">
                  {rowHasData ? (
                    <>
                      <span className="text-xs text-pm-muted">
                        Views: {v.view_count.toLocaleString()}
                      </span>
                      <span className="text-xs text-pm-muted">
                        Clicks: {v.click_count.toLocaleString()}
                      </span>
                      <span className="text-xs text-pm-muted">
                        Leads: {leads.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs italic text-pm-faint">Building data…</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`flex items-center gap-1.5 text-xs ${
                  statusActive ? 'text-pm-accent' : 'text-pm-faint'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    statusActive ? 'bg-pm-accent' : 'bg-pm-ash'
                  }`} />
                  {statusLabel}
                </span>
                <button
                  onClick={() => handleManage(v.listing_id)}
                  className="text-xs text-pm-accent hover:underline font-medium"
                >
                  Manage &rarr;
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Totals */}
      <div className="mt-8 border-t border-pm-border pt-8">
        <p className="label-caps mb-4">Total This Month</p>
        {hasAnyData ? (
          <p className="text-sm text-pm-muted">
            {totalViews.toLocaleString()} views &middot; {totalClicks.toLocaleString()} clicks &middot; {totalLeads.toLocaleString()} leads
          </p>
        ) : (
          <p className="text-sm italic text-pm-faint">Building data…</p>
        )}
      </div>
    </div>
  )
}
