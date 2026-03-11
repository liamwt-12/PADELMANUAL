import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { exchangeCode, listAccounts, listLocations } from '@/lib/gbp'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const email = searchParams.get('state')
  const error = searchParams.get('error')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padelmanual.com'

  if (error) {
    console.error('GBP OAuth error:', error)
    return NextResponse.redirect(`${siteUrl}/venue/dashboard/settings?gbp=error`)
  }

  if (!code || !email) {
    return NextResponse.redirect(`${siteUrl}/venue/dashboard/settings?gbp=error`)
  }

  try {
    const redirectUri = `${siteUrl}/api/gbp/callback`

    // 1. Exchange code for tokens
    const tokens = await exchangeCode(code, redirectUri)

    // 2. Find their GBP account and location
    const accounts = await listAccounts(tokens.access_token)
    if (accounts.length === 0) {
      console.error('No GBP accounts found for', email)
      return NextResponse.redirect(`${siteUrl}/venue/dashboard/settings?gbp=no-account`)
    }

    // Try each account to find locations
    let selectedAccountId: string | null = null
    let selectedLocationId: string | null = null

    for (const account of accounts) {
      try {
        const locations = await listLocations(tokens.access_token, account.name)
        if (locations.length > 0) {
          selectedAccountId = account.name
          selectedLocationId = locations[0].name // Take first location
          break
        }
      } catch (err) {
        console.error(`Failed to list locations for ${account.name}:`, err)
      }
    }

    if (!selectedLocationId) {
      console.error('No GBP locations found for', email)
      return NextResponse.redirect(`${siteUrl}/venue/dashboard/settings?gbp=no-location`)
    }

    // 3. Store tokens and IDs in venue_owners
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )

    const { error: updateError } = await supabase
      .from('venue_owners')
      .update({
        gbp_access_token: tokens.access_token,
        gbp_refresh_token: tokens.refresh_token,
        gbp_account_id: selectedAccountId,
        gbp_location_id: selectedLocationId,
        gbp_connected_at: new Date().toISOString(),
      })
      .eq('email', email)

    if (updateError) {
      console.error('GBP token storage error:', updateError)
      return NextResponse.redirect(`${siteUrl}/venue/dashboard/settings?gbp=error`)
    }

    return NextResponse.redirect(`${siteUrl}/venue/dashboard?gbp=connected`)
  } catch (err) {
    console.error('GBP callback error:', err)
    return NextResponse.redirect(`${siteUrl}/venue/dashboard/settings?gbp=error`)
  }
}
