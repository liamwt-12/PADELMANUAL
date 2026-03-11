'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { VenueOwnerProvider, useDashboard } from '@/lib/hooks/useVenueOwner'
import { createClient } from '@/lib/supabase-browser'
import UpgradeButton from '@/components/UpgradeButton'

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

const navItems = [
  { label: 'Overview', href: '/venue/dashboard', icon: IconOverview },
  { label: 'Your Listing', href: '/venue/dashboard/listing', icon: IconListing },
  { label: 'Leads', href: '/venue/dashboard/leads', icon: IconLeads },
  { label: 'Settings', href: '/venue/dashboard/settings', icon: IconSettings },
]

/* ── Shell inner (inside provider) ── */

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { owner, isPremium, isTrial, loading } = useDashboard()
  const pathname = usePathname()
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

  function isActive(href: string) {
    if (href === '/venue/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="py-6">
      <div className="flex gap-8">
        {/* ── Desktop sidebar ── */}
        <nav className="hidden sm:block w-44 shrink-0">
          <p className="label-caps mb-4">Menu</p>
          <ul className="space-y-0.5">
            {navItems.map(item => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
                      active
                        ? 'text-pm-text font-medium bg-pm-bg-hover'
                        : 'text-pm-muted hover:text-pm-text hover:bg-pm-bg-hover'
                    }`}
                  >
                    <Icon className={active ? 'text-pm-accent' : ''} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-8 pt-4 border-t border-pm-border/40">
            <button
              onClick={handleSignOut}
              className="text-xs text-pm-faint hover:text-pm-text transition-colors"
            >
              Sign out
            </button>
          </div>
        </nav>

        {/* ── Content area ── */}
        <div className="flex-1 min-w-0 pb-20 sm:pb-0">
          {/* Upgrade banner — every page, free/trial users only */}
          {!isPremium && !isTrial && (
            <div className="mb-6 rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-pm-accent">
              <div>
                <p className="text-sm font-medium text-pm-text">You&apos;re on the free plan.</p>
                <p className="text-xs text-pm-muted mt-0.5">
                  Unlock your full dashboard — analytics, leads, Google insights, and more.
                </p>
              </div>
              <UpgradeButton className="whitespace-nowrap self-start sm:self-center" />
            </div>
          )}

          {children}
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-pm-border/60 z-40">
        <div className="flex justify-around max-w-[960px] mx-auto">
          {navItems.map(item => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-2.5 px-3"
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
