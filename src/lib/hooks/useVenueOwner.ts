'use client'

import { useEffect, useState } from 'react'
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

export function useVenueOwner() {
  const [user, setUser] = useState<User | null>(null)
  const [owner, setOwner] = useState<VenueOwner | null>(null)
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setLoading(false)
        return
      }
      setUser(authUser)

      const { data: ownerData } = await supabase
        .from('venue_owners')
        .select('*')
        .eq('email', authUser.email!)
        .single()

      if (ownerData) {
        setOwner(ownerData as VenueOwner)

        if (ownerData.listing_id) {
          const { data: listingData } = await supabase
            .from('listings')
            .select('*')
            .eq('id', ownerData.listing_id)
            .single()

          if (listingData) {
            setListing(listingData as Listing)
          }
        }
      }

      setLoading(false)
    }

    load()
  }, [])

  const isPremium = owner?.subscription_status === 'premium'
  const isTrial = owner?.subscription_status === 'trial' &&
    (owner?.trial_ends_at ? new Date(owner.trial_ends_at) > new Date() : false)

  return { user, owner, listing, isPremium, isTrial, loading }
}
