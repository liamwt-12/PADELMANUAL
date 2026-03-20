'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { VenueOwnerProvider, useDashboard } from '@/lib/hooks/useVenueOwner'
import { createClient } from '@/lib/supabase-browser'
import NotificationBell from '@/components/NotificationBell'

/* ── Icons (Heroicons outline, 18×18) ── */

function IconOverview({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-[18px] h-[18px] ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function IconListing({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-[18px] h-[18px] ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}

function IconLeads({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-[18px] h-[18px] ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}

function IconSettings({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-[18px] h-[18px] ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconBack({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-[14px] h-[14px] ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  )
}

function IconAllVenues({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-[18px] h-[18px] ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function IconIntelligence({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-[18px] h-[18px] ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  )
}

function IconGBP({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-[18px] h-[18px] ${className}`} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5h-4.25a2.25 2.25 0 000 4.5H12.5a2.25 2.25 0 010 4.5H8.5M12 6.5v1.5m0 9v1.5" />
    </svg>
  )
}

function IconReviews({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-[18px] h-[18px] ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
}

function IconChevron({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-3.5 h-3.5 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

/* ── Venue Switcher dropdown ── */

function VenueSwitcher() {
  const { allVenues, activeVenueId, setActiveVenueId, listing } = useDashboard()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (allVenues.length <= 1) {
    return (
      <p className="text-xs font-medium text-pm-text truncate">
        {listing?.name || 'Your Venue'}
      </p>
    )
  }

  const activeName = allVenues.find(v => v.listing_id === activeVenueId)?.listing_name || listing?.name || 'Your Venue'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-pm-text hover:text-pm-accent transition-colors w-full text-left"
      >
        <span className="truncate">{activeName}</span>
        <IconChevron className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl border border-pm-border shadow-lg z-50 py-1.5">
          {allVenues.map(v => {
            const isActive = v.listing_id === activeVenueId
            return (
              <button
                key={v.listing_id}
                onClick={() => { setActiveVenueId(v.listing_id); setOpen(false) }}
                className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[13px] transition-colors ${
                  isActive ? 'text-pm-text font-medium' : 'text-pm-muted hover:text-pm-text hover:bg-pm-bg-hover'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isActive ? 'bg-pm-accent' : 'bg-pm-ash'
                }`} />
                <span className="truncate">{v.listing_name}</span>
                {v.subscription_status === 'premium' && (
                  <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-pm-accent shrink-0">
                    Premium
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Shell inner (inside provider) ── */

function ImpersonationBanner() {
  const { isImpersonating, impersonatedEmail, owner } = useDashboard()
  const router = useRouter()

  if (!isImpersonating) return null

  async function handleExit() {
    await fetch('/api/admin/impersonate/exit', { method: 'POST' })
    router.push('/venue/admin')
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 flex items-center justify-between gap-4">
      <p className="text-sm text-amber-900">
        <span className="mr-1.5">&#128065;</span>
        Viewing as <strong>{owner?.name || 'owner'}</strong> ({impersonatedEmail})
      </p>
      <button
        onClick={handleExit}
        className="text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap"
      >
        Exit preview &rarr;
      </button>
    </div>
  )
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { owner, listing, allVenues, isPremium, isTrial, isImpersonating, loading } = useDashboard()
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    if (!confirm('Sign out of your dashboard?')) return
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="py-8">
        <div className="flex gap-10">
          {/* Skeleton sidebar */}
          <div className="hidden sm:block w-56 shrink-0 space-y-4">
            <div className="h-3 w-24 bg-pm-ash/40 rounded animate-pulse" />
            <div className="h-3 w-16 bg-pm-ash/30 rounded animate-pulse" />
            <div className="mt-8 space-y-3">
              <div className="h-4 w-28 bg-pm-ash/30 rounded animate-pulse" />
              <div className="h-4 w-24 bg-pm-ash/30 rounded animate-pulse" />
              <div className="h-4 w-20 bg-pm-ash/30 rounded animate-pulse" />
              <div className="h-4 w-22 bg-pm-ash/30 rounded animate-pulse" />
            </div>
          </div>
          {/* Skeleton content */}
          <div className="flex-1 min-w-0 space-y-6">
            <div className="h-8 w-64 bg-pm-ash/40 rounded animate-pulse" />
            <div className="h-4 w-40 bg-pm-ash/30 rounded animate-pulse" />
            <div className="border-t border-pm-border mt-8" />
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <div className="h-12 w-24 bg-pm-ash/30 rounded animate-pulse" />
                <div className="h-3 w-20 bg-pm-ash/20 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-12 w-20 bg-pm-ash/30 rounded animate-pulse" />
                <div className="h-3 w-24 bg-pm-ash/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
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

  const isMultiVenue = allVenues.length > 1

  const gbpConnected = !!owner?.gbp_connected_at

  const navItems = [
    { label: 'Overview', href: '/venue/dashboard', icon: IconOverview },
    ...(isMultiVenue ? [{ label: 'All Venues', href: '/venue/dashboard/venues', icon: IconAllVenues }] : []),
    { label: 'Your Listing', href: '/venue/dashboard/listing', icon: IconListing },
    { label: 'Leads', href: '/venue/dashboard/leads', icon: IconLeads },
    { label: 'Intelligence', href: '/venue/dashboard/intelligence', icon: IconIntelligence, badge: (isPremium || isTrial) ? 'NEW' : undefined },
    ...(gbpConnected ? [{ label: 'GBP', href: '/venue/dashboard/gbp', icon: IconGBP }] : []),
    { label: 'Reviews', href: '/venue/dashboard/reviews', icon: IconReviews },
    { label: 'Settings', href: '/venue/dashboard/settings', icon: IconSettings },
  ]

  function isActive(href: string) {
    if (href === '/venue/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  const planLabel = isPremium ? 'Premium' : isTrial ? 'Trial' : 'Free'

  return (
    <div className="py-8">
      <div className="flex gap-10">
        {/* ── Desktop sidebar ── */}
        <nav className="hidden sm:flex sm:flex-col w-56 shrink-0">
          {/* Brand */}
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pm-text/40">
              Padel Manual
            </p>
            <Link
              href="/"
              className="flex items-center gap-1.5 mt-2 text-[11px] text-pm-faint hover:text-pm-accent transition-colors"
            >
              <IconBack />
              Back to site
            </Link>
          </div>

          {/* Nav items */}
          <ul className="space-y-1 flex-1">
            {navItems.map(item => {
              const active = isActive(item.href)
              const Icon = item.icon
              const badge = 'badge' in item ? (item as { badge?: string }).badge : undefined
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] transition-all ${
                      active
                        ? 'text-pm-accent font-medium border-l-2 border-pm-accent -ml-px'
                        : 'text-pm-muted hover:text-pm-text'
                    }`}
                  >
                    <Icon className={active ? 'text-pm-accent' : ''} />
                    {item.label}
                    {badge && (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-pm-accent bg-pm-accent/10 rounded-full px-1.5 py-0.5">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Bottom: venue info + sign out */}
          <div className="mt-auto pt-6 border-t border-pm-border/40">
            <VenueSwitcher />
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${
                isPremium ? 'bg-pm-accent' : isTrial ? 'bg-amber-400' : 'bg-pm-ash'
              }`} />
              <span className="text-[10px] text-pm-faint">{planLabel}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-4 text-[11px] text-pm-faint hover:text-pm-text transition-colors"
            >
              Sign out
            </button>
          </div>
        </nav>

        {/* ── Content area ── */}
        <div className="flex-1 min-w-0 pb-24 sm:pb-0">
          {/* Notification bell — desktop only, top right */}
          {(isPremium || isTrial) && (
            <div className="hidden sm:flex justify-end mb-2">
              <NotificationBell />
            </div>
          )}

          {/* Impersonation banner — always first */}
          <ImpersonationBanner />

          {/* Mobile venue switcher */}
          {isMultiVenue && (
            <div className="sm:hidden mb-4">
              <VenueSwitcher />
            </div>
          )}

          {/* Upgrade banner — every page, free users only, hidden when impersonating */}
          {!isImpersonating && !isPremium && !isTrial && (
            <div className="mb-8 rounded-2xl border border-pm-border/60 bg-pm-bg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-pm-accent">
              <div>
                <p className="text-sm font-medium text-pm-text">Get more from your listing.</p>
                <p className="text-xs text-pm-muted mt-0.5">
                  Unlock analytics, player leads, Google insights, and weekly reports.
                  From &pound;20.75/month on the annual plan.
                </p>
              </div>
              <a
                href="/venue/dashboard/settings"
                className="rounded-full bg-[#c4956a] text-white px-6 py-3 text-sm font-semibold tracking-wide transition-opacity hover:opacity-90 whitespace-nowrap self-start sm:self-center text-center"
              >
                See plans &rarr;
              </a>
            </div>
          )}

          {children}
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-pm-border/60 z-40 h-16">
        <div className="flex justify-around items-center h-full max-w-[960px] mx-auto">
          {navItems.map(item => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-4"
              >
                <Icon className={active ? 'text-pm-accent' : 'text-pm-faint'} />
                <span className={`text-[10px] ${active ? 'text-pm-text font-medium' : 'text-pm-faint'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

/* ── Shell wrapper (provider + inner) ── */

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <VenueOwnerProvider>
      <DashboardInner>{children}</DashboardInner>
    </VenueOwnerProvider>
  )
}
