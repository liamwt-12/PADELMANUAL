/**
 * Seed a demo venue owner account for testing the dashboard.
 *
 * Usage:
 *   npx tsx scripts/seed-demo-owner.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const DEMO_EMAIL = 'demo@padelmanual.com'
const DEMO_NAME = 'Demo Owner'
const VENUE_SLUG = 'rocket-padel-battersea' // Change to any real venue slug

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  // 1. Find the listing
  const { data: listing, error: listingErr } = await supabase
    .from('listings')
    .select('id, name, city, slug')
    .eq('slug', VENUE_SLUG)
    .single()

  if (listingErr || !listing) {
    console.error(`Listing "${VENUE_SLUG}" not found:`, listingErr?.message)
    process.exit(1)
  }

  console.log(`Found listing: ${listing.name} (${listing.city}) — ID ${listing.id}`)

  // 2. Create or update venue_owners row
  const { error: ownerErr } = await supabase
    .from('venue_owners')
    .upsert(
      {
        email: DEMO_EMAIL,
        name: DEMO_NAME,
        listing_id: listing.id,
        subscription_status: 'premium',
      },
      { onConflict: 'email' }
    )

  if (ownerErr) {
    console.error('Failed to upsert venue_owners:', ownerErr.message)
    process.exit(1)
  }

  console.log(`Venue owner upserted: ${DEMO_EMAIL} → premium`)

  // 3. Create auth user (ignore if already exists)
  const { error: authErr } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    email_confirm: true,
  })

  if (authErr && !authErr.message.includes('already been registered')) {
    console.error('Failed to create auth user:', authErr.message)
  } else {
    console.log(`Auth user ready: ${DEMO_EMAIL}`)
  }

  // 4. Mark listing as claimed
  await supabase
    .from('listings')
    .update({ claimed: true })
    .eq('id', listing.id)

  console.log(`Listing "${listing.name}" marked as claimed`)
  console.log('\nDone! Log in at /venue/login with demo@padelmanual.com')
}

main()
