'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboard } from '@/lib/hooks/useVenueOwner'
import { createClient } from '@/lib/supabase-browser'
import PricingSection from '@/components/PricingSection'
import ManageBillingButton from '@/components/ManageBillingButton'

function MultiVenuePricing({ venueCount }: { venueCount: number }) {
  const perVenueMonthly = 29
  const perVenueAnnual = 249
  const multiMonthly = 99
  const multiAnnual = 849
  const savingMonthly = (perVenueMonthly * venueCount) - multiMonthly

  return (
    <div>
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-pm-faint mb-4">
        Padel Manual Business
      </p>
      <p className="text-center text-sm text-pm-muted mb-8">
        You have {venueCount} venues on Padel Manual.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {/* Per venue */}
        <div className="rounded-2xl border border-pm-border p-6">
          <p className="text-sm font-medium text-pm-text">Per venue</p>
          <p className="font-serif text-3xl tracking-tight text-pm-text mt-3">
            &pound;{perVenueMonthly}
          </p>
          <p className="text-sm text-pm-muted mt-1">per month each</p>
          <p className="text-xs text-pm-faint mt-1">
            &pound;{perVenueAnnual}/year each
          </p>
          <a
            href="/venue/dashboard/settings"
            className="mt-6 w-full inline-block text-center rounded-full border border-pm-border px-6 py-3 text-sm font-medium text-pm-text hover:border-[#c4956a] transition-all"
          >
            Upgrade one &rarr;
          </a>
        </div>

        {/* All venues */}
        <div className="rounded-2xl border border-[#c4956a]/40 bg-[#c4956a]/[0.03] p-6">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-pm-text">All venues</p>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-pm-accent bg-pm-accent/[0.08] rounded-full px-2 py-0.5">
              Best value
            </span>
          </div>
          <p className="font-serif text-3xl tracking-tight text-pm-text mt-3">
            &pound;{multiMonthly}
          </p>
          <p className="text-sm text-pm-muted mt-1">per month</p>
          <p className="text-xs text-pm-faint mt-1">
            &pound;{multiAnnual}/year
          </p>
          <a
            href={`mailto:hello@padelmanual.com?subject=Multi-venue upgrade — ${venueCount} venues`}
            className="mt-6 w-full inline-block text-center rounded-full bg-[#c4956a] text-white px-6 py-3 text-sm font-semibold tracking-wide transition-opacity hover:opacity-90"
          >
            Upgrade all {venueCount} &rarr;
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-pm-muted">
        Saving &pound;{savingMonthly}/month vs paying per venue.
      </p>
    </div>
  )
}

export default function SettingsPage() {
  const { user, owner, listing, allVenues, isPremium, isTrial } = useDashboard()
  const router = useRouter()
  const isMultiVenue = allVenues.length > 1

  useEffect(() => {
    document.title = 'Settings — Padel Manual Dashboard'
  }, [])

  async function handleSignOut() {
    if (!confirm('Sign out of your dashboard?')) return
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDisconnectGBP() {
    if (!confirm('Disconnect your Google Business Profile? You can reconnect anytime.')) return
    await fetch('/api/gbp/disconnect', { method: 'POST' })
    router.refresh()
  }

  const trialEnd = owner?.trial_ends_at
    ? new Date(owner.trial_ends_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div>
      <div className="mb-6">
        <p className="label-caps">Settings</p>
        <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight">Account</h1>
      </div>

      {/* Account info */}
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card divide-y divide-pm-border/40 mb-6">
        <div className="px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-pm-faint">Email</p>
          <p className="mt-0.5 text-sm text-pm-text">{user?.email}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-pm-faint">Name</p>
          <p className="mt-0.5 text-sm text-pm-text">{owner?.name || '—'}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-pm-faint">Venue</p>
          <p className="mt-0.5 text-sm text-pm-text">{listing?.name || '—'}</p>
          {listing?.city && <p className="text-xs text-pm-faint">{listing.city}</p>}
          {isMultiVenue && (
            <p className="text-xs text-pm-accent mt-1">{allVenues.length} venues claimed</p>
          )}
        </div>
      </div>

      {/* Plan */}
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-5 mb-6">
        <p className="label-caps mb-2">Your Plan</p>
        {isPremium ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-serif font-bold tracking-tight">Premium</p>
              <p className="text-xs text-pm-faint mt-0.5">Full analytics, leads, Google insights</p>
            </div>
            {owner?.stripe_customer_id && <ManageBillingButton />}
          </div>
        ) : isTrial ? (
          <div>
            <p className="text-lg font-serif font-bold tracking-tight">Trial</p>
            {trialEnd && (
              <p className="text-xs text-pm-faint mt-0.5">Trial ends {trialEnd}</p>
            )}
          </div>
        ) : isMultiVenue ? (
          <MultiVenuePricing venueCount={allVenues.length} />
        ) : (
          <PricingSection />
        )}
      </div>

      {/* Google Business Profile */}
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-5 mb-6">
        <p className="label-caps mb-2">Google Business Profile</p>
        {owner?.gbp_connected_at ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
              <span className="text-xs text-pm-faint">
                since {new Date(owner.gbp_connected_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <button
              onClick={handleDisconnectGBP}
              className="text-xs text-pm-faint hover:text-red-500 transition-colors mt-3"
            >
              Disconnect Google Business Profile
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-pm-muted">Not connected</p>
            <p className="text-xs text-pm-faint mt-1">
              Connect to see search impressions, direction requests, and calls.
            </p>
            <a href="/api/gbp/connect" className="btn-secondary text-xs mt-3 inline-block">
              Connect Google Business Profile →
            </a>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="pt-4 border-t border-pm-border/40">
        <button
          onClick={handleSignOut}
          className="text-sm text-pm-faint hover:text-pm-text transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
