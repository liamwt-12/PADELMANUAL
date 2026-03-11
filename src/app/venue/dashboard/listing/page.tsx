'use client'

import { useDashboard } from '@/lib/hooks/useVenueOwner'

export default function ListingPage() {
  const { listing, isPremium, isTrial } = useDashboard()

  const fields = [
    { label: 'Website', value: listing?.website_url, free: true },
    { label: 'Booking URL', value: listing?.booking_url, free: true },
    { label: 'Phone', value: listing?.phone, free: true },
    { label: 'Short blurb', value: listing?.short_blurb, free: false },
    { label: 'Description', value: listing?.description, free: false },
    { label: 'Instagram', value: listing?.instagram_url, free: false },
    { label: 'Email', value: listing?.email, free: false },
  ]

  const filledCount = fields.filter(f => f.value).length
  const totalCount = fields.length
  const completionPct = Math.round((filledCount / totalCount) * 100)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="label-caps">Your Listing</p>
        <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight">
          {listing?.name || 'Your Venue'}
        </h1>
        {listing && (
          <a href={`/${listing.slug}`} className="text-xs text-pm-accent hover:underline mt-1 inline-block">
            View live listing →
          </a>
        )}
      </div>

      {/* Completion bar */}
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-pm-text">Listing completeness</p>
          <p className="text-sm font-serif font-bold text-pm-accent">{completionPct}%</p>
        </div>
        <div className="h-1.5 bg-pm-bg-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-pm-accent rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-pm-faint">
          {filledCount} of {totalCount} fields completed
        </p>
      </div>

      {/* Fields */}
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card divide-y divide-pm-border/40">
        {fields.map(field => {
          const locked = !field.free && !isPremium && !isTrial
          return (
            <div key={field.label} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-pm-text">{field.label}</p>
                {field.value ? (
                  <p className="text-xs text-pm-muted truncate mt-0.5">{field.value}</p>
                ) : (
                  <p className="text-xs text-pm-faint mt-0.5">Not set</p>
                )}
              </div>
              {locked ? (
                <span className="text-[10px] text-pm-accent font-medium shrink-0">Premium</span>
              ) : (
                <span className="text-xs text-pm-faint shrink-0">Edit coming soon</span>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-pm-faint text-center">
        Full listing editor launching soon — you&apos;ll be able to update everything from here.
      </p>
    </div>
  )
}
