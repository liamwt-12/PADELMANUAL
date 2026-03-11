'use client'

import { useRouter } from 'next/navigation'
import { useDashboard } from '@/lib/hooks/useVenueOwner'
import { createClient } from '@/lib/supabase-browser'
import UpgradeButton from '@/components/UpgradeButton'
import ManageBillingButton from '@/components/ManageBillingButton'

export default function SettingsPage() {
  const { user, owner, listing, isPremium, isTrial } = useDashboard()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/venue/login')
  }

  async function handleDisconnectGBP() {
    if (!confirm('Disconnect your Google Business Profile? You can reconnect anytime.')) return
    await fetch('/api/gbp/disconnect', { method: 'POST' })
    router.refresh()
  }

  const planLabel = isPremium ? 'Premium' : isTrial ? 'Trial' : 'Free'
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
        </div>
      </div>

      {/* Plan */}
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-5 mb-6">
        <p className="label-caps mb-2">Your Plan</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-serif font-bold tracking-tight">{planLabel}</p>
            {isTrial && trialEnd && (
              <p className="text-xs text-pm-faint mt-0.5">Trial ends {trialEnd}</p>
            )}
            {!isPremium && !isTrial && (
              <p className="text-xs text-pm-faint mt-0.5">Basic listing management</p>
            )}
            {isPremium && (
              <p className="text-xs text-pm-faint mt-0.5">Full analytics, leads, Google insights</p>
            )}
          </div>
          {!isPremium && !isTrial && <UpgradeButton />}
          {isPremium && owner?.stripe_customer_id && <ManageBillingButton />}
        </div>
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
