'use client'

import { useVenueOwner } from '@/lib/hooks/useVenueOwner'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { owner, listing, isPremium, isTrial, loading } = useVenueOwner()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/venue/login')
  }

  if (loading) {
    return (
      <main className="py-20 text-center">
        <div className="w-6 h-6 border-2 border-pm-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-sm text-pm-muted">Loading your dashboard...</p>
      </main>
    )
  }

  if (!owner) {
    return (
      <main className="py-20 text-center">
        <h1 className="font-serif text-2xl font-bold tracking-tight">No listing found</h1>
        <p className="mt-3 text-sm text-pm-muted max-w-md mx-auto">
          We couldn&apos;t find a venue linked to your account.{' '}
          <a href="/find" className="text-pm-accent hover:underline">Find your venue</a> and claim it.
        </p>
      </main>
    )
  }

  return (
    <main className="py-8">
      {/* Upgrade banner for free users */}
      {!isPremium && !isTrial && (
        <div className="mb-8 rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-pm-accent">
          <div>
            <p className="text-sm font-medium text-pm-text">You&apos;re on the free plan.</p>
            <p className="text-xs text-pm-muted mt-0.5">
              Unlock your full dashboard — analytics, leads, Google insights, and more.
            </p>
          </div>
          <button className="btn-primary text-xs whitespace-nowrap">
            Upgrade for £29/mo →
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
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
        <button
          onClick={handleSignOut}
          className="text-xs text-pm-faint hover:text-pm-text transition-colors mt-2"
        >
          Sign out
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6">
          <p className="label-caps">Listing Views</p>
          <p className="mt-2 font-serif text-3xl font-bold tracking-tight">
            {listing?.view_count?.toLocaleString() ?? '0'}
          </p>
          <p className="mt-1 text-xs text-pm-faint">All time</p>
        </div>
        <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6">
          <p className="label-caps">Booking Clicks</p>
          <p className="mt-2 font-serif text-3xl font-bold tracking-tight">
            {listing?.click_count?.toLocaleString() ?? '0'}
          </p>
          <p className="mt-1 text-xs text-pm-faint">All time</p>
        </div>
      </div>

      {/* Quick links */}
      {listing && (
        <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6">
          <p className="label-caps mb-3">Your Listing</p>
          <h3 className="font-serif text-lg font-semibold tracking-tight">{listing.name}</h3>
          {listing.short_blurb && (
            <p className="mt-1 text-sm text-pm-muted">{listing.short_blurb}</p>
          )}
          <div className="mt-4 flex gap-3">
            <a href={`/${listing.slug}`} className="btn-secondary text-xs">
              View live listing →
            </a>
          </div>
        </div>
      )}

      {/* Premium feature previews */}
      {!isPremium && !isTrial && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Player Leads', description: 'See every enquiry from your listing' },
            { label: 'Google Insights', description: 'Searches, calls, and direction requests' },
            { label: 'Court Utilisation', description: 'Booking data from Playtomic' },
            { label: 'Weekly Report', description: 'Monday morning stats email' },
          ].map((feature) => (
            <div key={feature.label} className="rounded-2xl border border-pm-border/60 bg-pm-bg-card p-5 opacity-60">
              <p className="label-caps">{feature.label}</p>
              <p className="mt-2 text-sm text-pm-muted">{feature.description}</p>
              <p className="mt-3 text-xs text-pm-accent font-medium">Premium feature</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
