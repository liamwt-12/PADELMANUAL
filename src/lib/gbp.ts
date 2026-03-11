/**
 * Google Business Profile API helpers.
 *
 * APIs used:
 * - My Business Account Management: mybusinessaccountmanagement.googleapis.com
 * - My Business Business Information: mybusinessbusinessinformation.googleapis.com
 * - Business Profile Performance: businessprofileperformance.googleapis.com
 *
 * Scope: https://www.googleapis.com/auth/business.manage
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token'

export type GBPTokens = {
  access_token: string
  refresh_token: string
  expires_in: number
}

export type GBPAccount = {
  name: string          // e.g. "accounts/123456"
  accountName: string   // e.g. "My Business"
  type: string
}

export type GBPLocation = {
  name: string          // e.g. "locations/789"
  title: string         // e.g. "Rocket Padel Battersea"
  storefrontAddress?: { locality?: string }
}

export type GBPInsights = {
  searches: number
  directions: number
  calls: number
  websiteClicks: number
  period: string        // e.g. "Last 28 days"
}

/** Exchange auth code for tokens */
export async function exchangeCode(code: string, redirectUri: string): Promise<GBPTokens> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }
  return res.json()
}

/** Refresh an expired access token */
export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token refresh failed: ${err}`)
  }
  return res.json()
}

/** List all GBP accounts for the authenticated user */
export async function listAccounts(accessToken: string): Promise<GBPAccount[]> {
  const res = await fetch(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error(`List accounts failed: ${res.status}`)
  const data = await res.json()
  return data.accounts || []
}

/** List locations for a given account */
export async function listLocations(accessToken: string, accountName: string): Promise<GBPLocation[]> {
  const res = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error(`List locations failed: ${res.status}`)
  const data = await res.json()
  return data.locations || []
}

/** Fetch performance metrics for the last 28 days */
export async function fetchInsights(accessToken: string, locationId: string): Promise<GBPInsights> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 28)

  const fmt = (d: Date) => ({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() })

  const dailyRange = {
    start_date: fmt(startDate),
    end_date: fmt(endDate),
  }

  const metrics = [
    'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
    'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
    'BUSINESS_DIRECTION_REQUESTS',
    'CALL_CLICKS',
    'WEBSITE_CLICKS',
  ]

  const params = new URLSearchParams()
  metrics.forEach(m => params.append('dailyMetrics', m))
  params.set('dailyRange.startDate.year', String(dailyRange.start_date.year))
  params.set('dailyRange.startDate.month', String(dailyRange.start_date.month))
  params.set('dailyRange.startDate.day', String(dailyRange.start_date.day))
  params.set('dailyRange.endDate.year', String(dailyRange.end_date.year))
  params.set('dailyRange.endDate.month', String(dailyRange.end_date.month))
  params.set('dailyRange.endDate.day', String(dailyRange.end_date.day))

  const res = await fetch(
    `https://businessprofileperformance.googleapis.com/v1/${locationId}:fetchMultiDailyMetricsTimeSeries?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Fetch insights failed (${res.status}): ${errText}`)
  }

  const data = await res.json()

  // Sum up daily values for each metric
  let desktopSearches = 0
  let mobileSearches = 0
  let directions = 0
  let calls = 0
  let websiteClicks = 0

  for (const series of data.multiDailyMetricTimeSeries || []) {
    const metric = series.dailyMetric
    const total = sumTimeSeries(series.dailySubEntityType?.timeSeries || series.timeSeries)

    switch (metric) {
      case 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH': desktopSearches = total; break
      case 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH': mobileSearches = total; break
      case 'BUSINESS_DIRECTION_REQUESTS': directions = total; break
      case 'CALL_CLICKS': calls = total; break
      case 'WEBSITE_CLICKS': websiteClicks = total; break
    }
  }

  return {
    searches: desktopSearches + mobileSearches,
    directions,
    calls,
    websiteClicks,
    period: 'Last 28 days',
  }
}

function sumTimeSeries(timeSeries: unknown): number {
  if (!timeSeries || !Array.isArray(timeSeries)) return 0
  let total = 0
  for (const ts of timeSeries) {
    const points = (ts as { dataPoints?: { value?: number }[] }).dataPoints
    if (Array.isArray(points)) {
      for (const p of points) {
        total += p.value ?? 0
      }
    }
  }
  return total
}
