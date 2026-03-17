'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Listing } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

export type VenueOwner = {
  id: string
  email: string
  name: string | null
  listing_id: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: 'free' | 'premium' | 'trial'
  trial_ends_at: string | null
  gbp_access_token: string | null
  gbp_refresh_token: string | null
  gbp_account_id: string | null
  gbp_location_id: string | null
  gbp_connected_at: string | null
  created_at: string
  updated_at: string
}

export type VenueInfo = {
  owner_id: string
  listing_id: string
  listing_name: string
  listing_city: string | null
  listing_slug: string
  subscription_status: 'free' | 'premium' | 'trial'
  view_count: number
  click_count: number
}

type DashboardData = {
  user: User | null
  owner: VenueOwner | null
  listing: Listing | null
  allVenues: VenueInfo[]
  activeVenueId: string | null
  setActiveVenueId: (id: string) => void
  isPremium: boolean
  isTrial: boolean
  loading: boolean
  refresh: () => Promise<void>
}

const STORAGE_KEY = 'pm_active_venue'

function useVenueOwner(): DashboardData {
  const [user, setUser] = useState<User | null>(null)
  const [owner, setOwner] = useState<VenueOwner | null>(null)
  const [listing, setListing] = useState<Listing | null>(null)
  const [allVenues, setAllVenues] = useState<VenueInfo[]>([])
  const [activeVenueId, setActiveVenueIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      setLoading(false)
      return
    }
    setUser(authUser)

    // Fetch ALL venue_owner rows for this email
    const { data: ownerRows } = await supabase
      .from('venue_owners')
      .select('*')
      .eq('email', authUser.email!)
      .order('created_at', { ascending: true })

    if (!ownerRows || ownerRows.length === 0) {
      setLoading(false)
      return
    }

    // Fetch listing summaries for all owned venues
    const listingIds = ownerRows
      .map(o => o.listing_id)
      .filter(Boolean) as string[]

    const { data: listingSummaries } = await supabase
      .from('listings')
      .select('id, name, city, slug, view_count, click_count')
      .in('id', listingIds)

    // Build allVenues array
    const venues: VenueInfo[] = ownerRows
      .filter(o => o.listing_id)
      .map(o => {
        const l = listingSummaries?.find(ls => ls.id === o.listing_id)
        return {
          owner_id: o.id,
          listing_id: o.listing_id!,
          listing_name: l?.name || 'Unknown venue',
          listing_city: l?.city || null,
          listing_slug: l?.slug || '',
          subscription_status: o.subscription_status as VenueInfo['subscription_status'],
          view_count: l?.view_count || 0,
          click_count: l?.click_count || 0,
        }
      })

    setAllVenues(venues)

    // Determine active venue from localStorage or default to first
    let storedId: string | null = null
    try { storedId = localStorage.getItem(STORAGE_KEY) } catch {}
    const activeId = venues.find(v => v.listing_id === storedId)?.listing_id
      || venues[0]?.listing_id
      || null

    setActiveVenueIdState(activeId)

    // Set active owner
    const activeOwner = ownerRows.find(o => o.listing_id === activeId) || ownerRows[0]
    setOwner(activeOwner as VenueOwner)

    // Fetch full listing for active venue
    if (activeOwner?.listing_id) {
      const { data: listingData } = await supabase
        .from('listings')
        .select('*')
        .eq('id', activeOwner.listing_id)
        .single()

      if (listingData) {
        setListing(listingData as Listing)
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const refresh = useCallback(async () => {
    await load()
  }, [load])

  const setActiveVenueId = useCallback((id: string) => {
    try { localStorage.setItem(STORAGE_KEY, id) } catch {}
    setActiveVenueIdState(id)
    setLoading(true)
    load()
  }, [load])

  const isPremium = owner?.subscription_status === 'premium'
  const isTrial = owner?.subscription_status === 'trial' &&
    (owner?.trial_ends_at ? new Date(owner.trial_ends_at) > new Date() : false)

  return { user, owner, listing, allVenues, activeVenueId, setActiveVenueId, isPremium, isTrial, loading, refresh }
}

// Context provider — wraps the dashboard shell so all pages share one data fetch
const DashboardContext = createContext<DashboardData | null>(null)

export function VenueOwnerProvider({ children }: { children: ReactNode }) {
  const data = useVenueOwner()
  return <DashboardContext.Provider value={data}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within VenueOwnerProvider')
  return ctx
}
