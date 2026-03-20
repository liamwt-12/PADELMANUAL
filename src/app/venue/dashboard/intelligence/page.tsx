'use client'

import { useEffect, useState } from 'react'
import { useDashboard } from '@/lib/hooks/useVenueOwner'
import Link from 'next/link'

type Brief = {
  id: string
  listing_id: string
  week_start: string
  brief_text: string
  action_item: string
  metrics: Record<string, number | string | null> | null
  read_at: string | null
  created_at: string
}

type NearbyVenue = {
  name: string
  slug: string
  distance: number
  view_count: number
  courts: number | null
  indoor: boolean | null
}

function formatWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function MetricPill({ label, value, delta }: { label: string; value: number | string; delta?: number | null }) {
  const showDelta = delta != null && delta !== 0
  const isUp = (delta ?? 0) > 0
  return (
    <div className="flex items-center gap-2 text-xs">
      {showDelta && (
        <span className={isUp ? 'text-pm-accent font-medium' : 'text-pm-muted'}>
          {isUp ? '\u2191' : '\u2193'} {Math.abs(delta!)}%
        </span>
      )}
      <span className="text-pm-text font-medium">{typeof value === 'number' ? value.toLocaleString() : value}</span>
      <span className="text-pm-faint">{label}</span>
    </div>
  )
}

function pctDelta(current: number, previous: number): number | null {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 100)
}

export default function IntelligencePage() {
  const { listing, isPremium, isTrial } = useDashboard()
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedBrief, setExpandedBrief] = useState<string | null>(null)
  const [nearbyVenues, setNearbyVenues] = useState<NearbyVenue[]>([])

  useEffect(() => {
    if (!listing) return
    fetch(`/api/venue/briefs?listing_id=${listing.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.briefs) setBriefs(data.briefs)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [listing])

  useEffect(() => {
    if (!listing) return
    fetch(`/api/venue/nearby-venues?listing_id=${listing.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.venues) setNearbyVenues(data.venues) })
      .catch(() => {})
  }, [listing])

  const latest = briefs[0] || null
  const previousBriefs = briefs.slice(1)

  const m = latest?.metrics || {}
  const viewsDelta = pctDelta(
    (m.views_this_week as number) || 0,
    (m.views_last_week as number) || 0,
  )
  const clicksDelta = pctDelta(
    (m.clicks_this_week as number) || 0,
    (m.clicks_last_week as number) || 0,
  )

  if (!isPremium && !isTrial) {
    return (
      <div>
        <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-pm-text mb-2">
          Intelligence
        </h2>
        <p className="text-sm text-pm-muted mb-8">
          Weekly briefs with actionable insights for your venue.
        </p>
        <div className="rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-8">
          <p className="text-sm text-pm-muted leading-relaxed">
            <Link href="/venue/dashboard/settings" className="text-pm-accent hover:underline font-medium">
              Upgrade to Premium
            </Link>
            {' '}to receive weekly intelligence briefs with performance data, competitor insights, and a clear action for each week.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-pm-text mb-1">
        Intelligence
      </h2>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 rounded bg-pm-border/20 animate-pulse" />
          ))}
        </div>
      ) : !latest ? (
        <div className="mt-6">
          <p className="text-sm text-pm-muted">
            Your first brief will be ready Monday morning.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-pm-muted mb-6">
            Week of {formatWeek(latest.week_start)}
          </p>

          {/* Metrics strip */}
          {latest.metrics && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 pb-6 border-b border-pm-border/40">
              <MetricPill
                label="Views"
                value={(m.views_this_week as number) || 0}
                delta={viewsDelta}
              />
              <MetricPill
                label="Clicks"
                value={(m.clicks_this_week as number) || 0}
                delta={clicksDelta}
              />
              <MetricPill
                label="Leads"
                value={(m.leads_this_week as number) || 0}
              />
              {(m.google_review_count as number) > 0 && (
                <MetricPill
                  label="Google Reviews"
                  value={m.google_review_count as number}
                />
              )}
            </div>
          )}

          {/* Brief text */}
          <div className="text-[15px] leading-[1.9] text-pm-text whitespace-pre-line max-w-2xl">
            {latest.brief_text}
          </div>

          {/* Action item */}
          <div className="mt-8 pt-8 border-t border-pm-border">
            <p className="label-caps mb-4">This Week&apos;s Action</p>
            <p className="text-[15px] text-pm-text leading-relaxed max-w-2xl">
              {latest.action_item}
            </p>
            {latest.action_item.toLowerCase().includes('review') && (
              <Link
                href="/venue/dashboard/reviews"
                className="inline-flex items-center mt-4 rounded-full bg-pm-accent text-white px-5 py-2.5 text-xs font-medium transition-opacity hover:opacity-90"
              >
                Reply to review &rarr;
              </Link>
            )}
            {latest.action_item.toLowerCase().includes('lead') && (
              <Link
                href="/venue/dashboard/leads"
                className="inline-flex items-center mt-4 rounded-full bg-pm-accent text-white px-5 py-2.5 text-xs font-medium transition-opacity hover:opacity-90"
              >
                View leads &rarr;
              </Link>
            )}
            {latest.action_item.toLowerCase().includes('listing') && (
              <Link
                href="/venue/dashboard/listing"
                className="inline-flex items-center mt-4 rounded-full bg-pm-accent text-white px-5 py-2.5 text-xs font-medium transition-opacity hover:opacity-90"
              >
                Edit listing &rarr;
              </Link>
            )}
          </div>

          {/* Previous briefs */}
          {previousBriefs.length > 0 && (
            <div className="mt-10 pt-8 border-t border-pm-border">
              <p className="label-caps mb-4">Previous Briefs</p>
              <div className="space-y-0">
                {previousBriefs.map(brief => (
                  <div key={brief.id} className="border-b border-pm-border/30">
                    <button
                      onClick={() => setExpandedBrief(expandedBrief === brief.id ? null : brief.id)}
                      className="w-full flex items-center justify-between py-4 text-left group"
                    >
                      <span className="text-sm text-pm-muted group-hover:text-pm-text transition-colors">
                        Week of {formatWeek(brief.week_start)}
                      </span>
                      <span className={`text-pm-faint text-xs transition-transform ${expandedBrief === brief.id ? 'rotate-90' : ''}`}>
                        &#9656;
                      </span>
                    </button>
                    {expandedBrief === brief.id && (
                      <div className="pb-6">
                        <div className="text-sm leading-[1.8] text-pm-muted whitespace-pre-line max-w-2xl">
                          {brief.brief_text}
                        </div>
                        <div className="mt-4 pt-4 border-t border-pm-border/20">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-accent mb-2">Action</p>
                          <p className="text-sm text-pm-muted">{brief.action_item}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Task 5: Venues in your area */}
      {nearbyVenues.length > 0 && (
        <div className="mt-10 pt-8 border-t border-pm-border">
          <p className="label-caps mb-6">Venues in Your Area</p>
          <div className="space-y-0">
            {nearbyVenues.map(venue => (
              <div key={venue.slug} className="flex items-center justify-between py-4 border-b border-pm-border/30">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-pm-text truncate">{venue.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-pm-faint">
                      {venue.view_count.toLocaleString()} listing views this month
                    </span>
                    {venue.courts && (
                      <>
                        <span className="text-pm-faint">&middot;</span>
                        <span className="text-xs text-pm-faint">
                          {venue.courts} court{venue.courts !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                    {venue.indoor != null && (
                      <>
                        <span className="text-pm-faint">&middot;</span>
                        <span className="text-xs text-pm-faint">
                          {venue.indoor ? 'Indoor' : 'Outdoor'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="text-xs text-pm-faint">{venue.distance} miles</span>
                  <Link
                    href={`/${venue.slug}`}
                    className="text-xs text-pm-accent hover:underline font-medium"
                  >
                    View listing &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
