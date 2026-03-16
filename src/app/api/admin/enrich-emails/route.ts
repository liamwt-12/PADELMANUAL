import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 300

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY!
const DETAIL_FIELDS = 'id,displayName,websiteUri,nationalPhoneNumber,internationalPhoneNumber,formattedAddress'

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const CONTACT_PATHS = ['/contact', '/contact-us', '/about']

// ── email scraper helpers (mirrored from scrape-emails route) ──

function isValidEmail(email: string): boolean {
  const lower = email.toLowerCase()
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') ||
      lower.endsWith('.svg') || lower.endsWith('.gif') || lower.endsWith('.webp')) return false
  if (lower.includes('example.com') || lower.includes('sentry') ||
      lower.includes('wixpress') || lower.includes('wordpress') ||
      lower.includes('cloudflare') || lower.includes('@2x')) return false
  if (lower.startsWith('noreply@') || lower.startsWith('no-reply@')) return false
  return true
}

function pickBestEmail(emails: string[]): string | null {
  const valid = emails.filter(isValidEmail)
  if (valid.length === 0) return null
  const priority = ['contact@', 'info@', 'hello@', 'bookings@', 'enquiries@', 'reception@', 'admin@']
  for (const prefix of priority) {
    const match = valid.find(e => e.toLowerCase().startsWith(prefix))
    if (match) return match.toLowerCase()
  }
  return valid[0].toLowerCase()
}

async function scrapeEmailFromPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PadelManual/1.0 (UK padel venue directory, hello@padelmanual.com)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const html = await res.text()

    const mailtoMatches = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi)
    if (mailtoMatches) {
      const mailtoEmails = mailtoMatches.map(m => m.replace(/^mailto:/i, ''))
      const best = pickBestEmail(mailtoEmails)
      if (best) return best
    }

    const allEmails = [...new Set(html.match(EMAIL_RE) || [])]
    return pickBestEmail(allEmails)
  } catch {
    return null
  }
}

async function findEmailFromWebsite(websiteUrl: string): Promise<string | null> {
  let baseUrl = websiteUrl.trim()
  if (!baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl
  baseUrl = baseUrl.replace(/\/+$/, '')

  const email = await scrapeEmailFromPage(baseUrl)
  if (email) return email

  let origin: string
  try { origin = new URL(baseUrl).origin } catch { return null }

  for (const path of CONTACT_PATHS) {
    const found = await scrapeEmailFromPage(`${origin}${path}`)
    if (found) return found
  }
  return null
}

// ── Google Places helpers ──

async function textSearchPlace(query: string): Promise<string | null> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': PLACES_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName',
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'en',
      maxResultCount: 1,
    }),
  })
  const data = await res.json()
  return data.places?.[0]?.id || null
}

async function getPlaceDetails(placeId: string) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`,
    {
      headers: {
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': DETAIL_FIELDS,
      },
    },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Places detail error ${res.status}: ${text}`)
  }
  return res.json()
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── types ──

type LogEntry = {
  id: string
  name: string
  step: string
  place_id_found: boolean
  website_found: boolean
  phone_found: boolean
  email_found: boolean
  error?: string
}

export async function POST(request: NextRequest) {
  const adminSecret = request.headers.get('x-admin-secret') || request.headers.get('authorization')?.replace('Bearer ', '')
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!PLACES_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY not configured' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  // Pagination
  const limit = Math.min(Math.max(parseInt(request.nextUrl.searchParams.get('limit') || '50') || 50, 1), 200)
  const offset = Math.max(parseInt(request.nextUrl.searchParams.get('offset') || '0') || 0, 0)

  // Fetch listings with no email that aren't permanently closed
  const { data: allListings, error, count } = await supabase
    .from('listings')
    .select('id, name, city, google_place_id, website_url, phone', { count: 'exact' })
    .is('email', null)
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalRemaining = count || 0

  if (!allListings || allListings.length === 0) {
    return NextResponse.json({ message: 'No listings need enrichment', processed: 0, total_remaining: totalRemaining, place_id_found: 0, website_found: 0, phone_found: 0, email_found: 0, errors: 0, next_offset: null, log: [] })
  }

  const listings = allListings
  const hasMore = offset + limit < totalRemaining
  const nextOffset = hasMore ? offset + limit : null

  const log: LogEntry[] = []
  let placeIdFoundCount = 0
  let websiteFoundCount = 0
  let phoneFoundCount = 0
  let emailFoundCount = 0
  let errorCount = 0

  // ── Pass 1: Google Places enrichment ──
  // Track listings that got a new website so we can scrape them in pass 2
  const newWebsiteListings: { id: string; name: string; website_url: string }[] = []

  for (const listing of listings) {
    const entry: LogEntry = {
      id: listing.id,
      name: listing.name,
      step: 'places',
      place_id_found: false,
      website_found: false,
      phone_found: false,
      email_found: false,
    }

    try {
      let placeId = listing.google_place_id as string | null

      // If no place_id, search for it
      if (!placeId) {
        const query = `${listing.name} padel ${listing.city || ''}`.trim()
        placeId = await textSearchPlace(query)
        await sleep(1000) // rate limit
      }

      if (!placeId) {
        entry.step = 'no_place_found'
        log.push(entry)
        continue
      }

      entry.place_id_found = true
      placeIdFoundCount++

      // Fetch place details
      const details = await getPlaceDetails(placeId)
      await sleep(1000) // rate limit

      // Build update payload
      const updates: Record<string, string | null> = {}

      // Store place_id if we didn't have it
      if (!listing.google_place_id) {
        updates.google_place_id = placeId
      }

      // Website
      if (!listing.website_url && details.websiteUri) {
        updates.website_url = details.websiteUri
        entry.website_found = true
        websiteFoundCount++
        newWebsiteListings.push({ id: listing.id, name: listing.name, website_url: details.websiteUri })
      }

      // Phone
      if (!listing.phone) {
        const phone = details.internationalPhoneNumber || details.nationalPhoneNumber || null
        if (phone) {
          updates.phone = phone
          entry.phone_found = true
          phoneFoundCount++
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateErr } = await supabase
          .from('listings')
          .update(updates)
          .eq('id', listing.id)
        if (updateErr) {
          entry.error = `DB update failed: ${updateErr.message}`
          errorCount++
        }
      }
    } catch (err) {
      entry.error = String(err)
      errorCount++

      // Handle quota errors gracefully
      if (String(err).includes('429') || String(err).includes('RESOURCE_EXHAUSTED')) {
        entry.error = 'Google API quota exceeded — stopping'
        log.push(entry)
        break
      }
    }

    log.push(entry)
  }

  // ── Pass 2: Scrape emails from websites in this batch ──
  // Re-fetch the same batch IDs to catch newly-added website_urls from pass 1
  const batchIds = listings.map(l => l.id)
  const { data: scrapeable } = await supabase
    .from('listings')
    .select('id, name, website_url')
    .is('email', null)
    .not('website_url', 'is', null)
    .in('id', batchIds)

  if (scrapeable && scrapeable.length > 0) {
    for (const listing of scrapeable) {
      const entry: LogEntry = {
        id: listing.id,
        name: listing.name,
        step: 'scrape',
        place_id_found: false,
        website_found: false,
        phone_found: false,
        email_found: false,
      }

      try {
        const email = await findEmailFromWebsite(listing.website_url!)
        if (email) {
          await supabase
            .from('listings')
            .update({ email })
            .eq('id', listing.id)
          entry.email_found = true
          emailFoundCount++
        }
      } catch (err) {
        entry.error = String(err)
        errorCount++
      }

      log.push(entry)
      await sleep(1000) // rate limit
    }
  }

  return NextResponse.json({
    processed: listings.length,
    total_remaining: totalRemaining,
    offset,
    limit,
    next_offset: nextOffset,
    place_id_found: placeIdFoundCount,
    website_found: websiteFoundCount,
    phone_found: phoneFoundCount,
    email_found: emailFoundCount,
    errors: errorCount,
    log,
  })
}
