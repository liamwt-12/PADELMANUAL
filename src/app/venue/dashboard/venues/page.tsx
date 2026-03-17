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
  const freeCount = allVenues.length - premiumCount
  const hasFreeVenues = freeCount > 0

  const totalViews = allVenues.reduce((sum, v) => sum + v.view_count, 0)
  const totalClicks = allVenues.reduce((sum, v) => sum + v.click_count, 0)
  const totalLeads = Object.values(leadStats).reduce((sum, c) => sum + c, 0)

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
          {freeCount > 0 && <> &middot; {freeCount} free</>}
        </p>
      </div>

      {/* Venue rows */}
      <div className="border-t border-pm-border">
        {allVenues.map(v => {
          const leads = leadStats[v.listing_id] || 0
          const isPremium = v.subscription_status === 'premium'

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
                  <span className="text-xs text-pm-muted">
                    Views: {v.view_count.toLocaleString()}
                  </span>
                  <span className="text-xs text-pm-muted">
                    Clicks: {v.click_count.toLocaleString()}
                  </span>
                  <span className="text-xs text-pm-muted">
                    Leads: {leads.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`flex items-center gap-1.5 text-xs ${
                  isPremium ? 'text-pm-accent' : 'text-pm-faint'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isPremium ? 'bg-pm-accent' : 'bg-pm-ash'
                  }`} />
                  {isPremium ? 'Premium' : 'Free'}
                </span>
                <button
                  onClick={() => handleManage(v.listing_id)}
                  className="text-xs text-pm-accent hover:underline font-medium"
                >
                  Manage &rarr;
                </button>
                {!isPremium && (
                  <a
                    href="/venue/dashboard/settings"
                    className="text-xs text-pm-muted hover:text-pm-accent transition-colors"
                  >
                    Upgrade &rarr;
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Totals */}
      <div className="mt-8 border-t border-pm-border pt-8">
        <p className="label-caps mb-4">Total This Month</p>
        <p className="text-sm text-pm-muted">
          {totalViews.toLocaleString()} views &middot; {totalClicks.toLocaleString()} clicks &middot; {totalLeads.toLocaleString()} leads
        </p>
      </div>

      {/* Upgrade all CTA */}
      {hasFreeVenues && (
        <div className="mt-8 border-t border-pm-border pt-8">
          <a
            href="/venue/dashboard/settings"
            className="inline-flex items-center rounded-full bg-[#c4956a] text-white px-6 py-3 text-sm font-semibold tracking-wide transition-opacity hover:opacity-90"
          >
            Upgrade all venues &rarr;
          </a>
          <p className="mt-2 text-xs text-pm-faint">
            &pound;99/month covers all {allVenues.length} venues
          </p>
        </div>
      )}
    </div>
  )
}
