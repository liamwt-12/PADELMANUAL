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
    const text = await res.text().catch(() => 'unable to read body')
    throw new Error(`Places detail error ${res.status}: ${text.slice(0, 300)}`)
  }
  return res.json()
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Sanitise any value into a JSON-safe string.
 * Handles: null/undefined, non-strings, control chars, lone surrogates, and
 * anything else that would make JSON.stringify choke.
 */
function safeString(val: unknown): string {
  if (val === null || val === undefined) return ''
  let raw: string
  try {
    raw = typeof val === 'string' ? val : String(val)
  } catch {
    return '[unstringifiable]'
  }
  try {
    // Strip C0/C1 control characters
    const cleaned = raw.replace(/[\x00-\x1f\x7f\x80-\x9f]/g, '')
    // Verify it round-trips through JSON
    JSON.stringify(cleaned)
    return cleaned
  } catch {
    // Nuclear fallback: keep only printable ASCII
    return raw.replace(/[^\x20-\x7e]/g, '')
  }
}

/** Sanitise error values so they survive JSON.stringify */
function safeError(err: unknown): string {
  try {
    const raw = err instanceof Error ? err.message : String(err)
    return safeString(raw).slice(0, 500)
  } catch {
    return 'Unknown error'
  }
}

/**
 * Build a JSON response manually so that if JSON.stringify fails we catch it
 * ourselves rather than letting it bubble into Next.js's error handler
 * (which produces the truncated {"error":"{\""} response).
 */
function jsonResponse(body: unknown, status = 200): NextResponse {
  let json: string
  try {
    json = JSON.stringify(body)
  } catch (err) {
    console.error('[enrich-emails] JSON.stringify failed for response body:', err)
    // Last-ditch: return a plain object we know is safe
    json = JSON.stringify({
      error: `Response serialisation failed: ${safeError(err)}`,
      hint: 'Check server logs for [enrich-emails] entries',
    })
  }
  return new NextResponse(json, {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/** Sanitise an entire listing row from Supabase — every field gets cleaned */
function sanitiseListing(row: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(row)) {
    if (typeof val === 'string') {
      clean[key] = safeString(val)
    } else {
      clean[key] = val
    }
  }
  return clean
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
  skipped?: boolean
}

/** Try to serialise a single log entry; if it fails, return a safe stub */
function safeLogEntry(entry: LogEntry): Record<string, unknown> {
  try {
    JSON.stringify(entry)
    return entry
  } catch (err) {
    console.error(`[enrich-emails] Log entry failed to serialise id=${entry.id}:`, err)
    return {
      id: safeString(entry.id),
      name: safeString(entry.name),
      step: entry.step,
      place_id_found: entry.place_id_found,
      website_found: entry.website_found,
      phone_found: entry.phone_found,
      email_found: entry.email_found,
      error: entry.error ? safeString(entry.error).slice(0, 200) : undefined,
      skipped: entry.skipped,
      _serialisation_error: true,
    }
  }
}

export async function POST(request: NextRequest) {
  const adminSecret = request.headers.get('x-admin-secret')
    || request.headers.get('authorization')?.replace('Bearer ', '')
    || request.cookies.get('admin_secret')?.value
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  if (!PLACES_API_KEY) {
    return jsonResponse({ error: 'GOOGLE_PLACES_API_KEY not configured' }, 500)
  }

  try {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  // Params
  const limit = Math.min(Math.max(parseInt(request.nextUrl.searchParams.get('limit') || '50') || 50, 1), 200)
  const offset = Math.max(parseInt(request.nextUrl.searchParams.get('offset') || '0') || 0, 0)
  const dryRun = request.nextUrl.searchParams.get('dry_run') === 'true'
  const singleId = request.nextUrl.searchParams.get('single_id')

  console.log(`[enrich-emails] Starting offset=${offset} limit=${limit} dry_run=${dryRun} single_id=${singleId || 'none'}`)

  // ── Single-ID mode: process one listing by UUID ──
  if (singleId) {
    const { data: row, error: rowErr } = await supabase
      .from('listings')
      .select('id, name, city, google_place_id, website_url, phone, email')
      .eq('id', singleId)
      .single()

    if (rowErr || !row) {
      return jsonResponse({ error: 'Listing not found', details: rowErr }, 404)
    }

    if (dryRun) {
      return jsonResponse({ mode: 'single_dry_run', listing: row })
    }

    // Process this single listing through the normal enrichment
    // (falls through to the main loop below with listings = [row])
  }

  // Minimal select — only the fields we need
  const LISTING_FIELDS = 'id, name, city, google_place_id, website_url, phone, email'

  let allListings: Record<string, unknown>[] | null = null
  let totalRemaining = 0

  if (singleId) {
    // Already fetched above — refetch cleanly into the batch format
    const { data } = await supabase
      .from('listings')
      .select(LISTING_FIELDS)
      .eq('id', singleId)
    allListings = data
    totalRemaining = 1
  } else {
    // Count (head-only, no row data)
    const { count } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .is('email', null)

    totalRemaining = count || 0

    // Fetch batch — simplified filter (no permanently_closed which may have bad data)
    const { data, error } = await supabase
      .from('listings')
      .select(LISTING_FIELDS)
      .is('email', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error(`[enrich-emails] Batch query failed at offset=${offset}:`, JSON.stringify(error))
      return jsonResponse({
        error: 'Supabase query failed',
        supabase_code: safeString(error.code || ''),
        supabase_message: safeString(error.message || ''),
        supabase_details: safeString(error.details || ''),
        supabase_hint: safeString(error.hint || ''),
        offset,
        limit,
        total_remaining: totalRemaining,
      }, 500)
    }

    allListings = data
  }

  if (!allListings || allListings.length === 0) {
    return jsonResponse({ message: 'No listings need enrichment', processed: 0, total_remaining: totalRemaining, place_id_found: 0, website_found: 0, phone_found: 0, email_found: 0, errors: 0, next_offset: null, log: [] })
  }

  // Sanitise every field from Supabase upfront
  const listings = allListings.map(row => sanitiseListing(row as Record<string, unknown>))

  // ── Dry run: return what would be processed ──
  if (dryRun) {
    return jsonResponse({
      mode: 'dry_run',
      offset,
      limit,
      total_remaining: totalRemaining,
      would_process: listings.length,
      listings: listings.map(l => ({
        id: l.id,
        name: l.name,
        city: l.city,
        has_place_id: !!l.google_place_id,
        has_website: !!l.website_url,
        has_phone: !!l.phone,
        has_email: !!l.email,
      })),
    })
  }

  console.log(`[enrich-emails] Fetched ${listings.length} listings, total_remaining=${totalRemaining}`)

  // Log every listing id+name at the start so we can see what we're about to process
  for (let i = 0; i < listings.length; i++) {
    console.log(`[enrich-emails]   [${i}] id=${listings[i].id} name="${listings[i].name}"`)
  }

  const hasMore = offset + limit < totalRemaining
  const nextOffset = hasMore ? offset + limit : null

  const log: LogEntry[] = []
  let placeIdFoundCount = 0
  let websiteFoundCount = 0
  let phoneFoundCount = 0
  let emailFoundCount = 0
  let errorCount = 0
  let skippedCount = 0

  // ── Pass 1: Google Places enrichment ──
  // Track listings that got a new website so we can scrape them in pass 2
  const newWebsiteListings: { id: string; name: string; website_url: string }[] = []

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i]
    const entry: LogEntry = {
      id: String(listing.id),
      name: String(listing.name || ''),
      step: 'places',
      place_id_found: false,
      website_found: false,
      phone_found: false,
      email_found: false,
    }

    try {
      console.log(`[enrich-emails] Pass1 [${i}/${listings.length}] id=${listing.id} name="${listing.name}"`)

      let placeId = listing.google_place_id as string | null

      // If no place_id, search for it
      if (!placeId) {
        const query = `${listing.name} padel ${listing.city || ''}`.trim()
        console.log(`[enrich-emails]   Searching Places API: "${safeString(query).slice(0, 100)}"`)
        placeId = await textSearchPlace(query)
        await sleep(1000) // rate limit
      }

      if (!placeId) {
        entry.step = 'no_place_found'
        log.push(entry)
        console.log(`[enrich-emails]   No place found, skipping`)
        continue
      }

      entry.place_id_found = true
      placeIdFoundCount++

      // Fetch place details
      console.log(`[enrich-emails]   Fetching details for placeId=${placeId}`)
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
        updates.website_url = safeString(details.websiteUri)
        entry.website_found = true
        websiteFoundCount++
        newWebsiteListings.push({
          id: String(listing.id),
          name: String(listing.name),
          website_url: safeString(details.websiteUri),
        })
      }

      // Phone
      if (!listing.phone) {
        const phone = details.internationalPhoneNumber || details.nationalPhoneNumber || null
        if (phone) {
          updates.phone = safeString(phone)
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
          entry.error = `DB update failed: ${safeError(updateErr)}`
          errorCount++
        }
      }

      console.log(`[enrich-emails]   Done: place=${entry.place_id_found} web=${entry.website_found} phone=${entry.phone_found}`)
    } catch (err) {
      console.error(`[enrich-emails] *** VENUE FAILED Pass1 [${i}] id=${listing.id} name="${listing.name}":`, err)
      const msg = safeError(err)
      errorCount++

      // Handle quota errors gracefully
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        entry.error = 'Google API quota exceeded — stopping'
        entry.skipped = true
        log.push(entry)
        break
      }

      entry.error = msg
      entry.skipped = true
      skippedCount++
    }

    log.push(entry)
  }

  // ── Pass 2: Scrape emails from websites in this batch ──
  // Re-fetch the same batch IDs to catch newly-added website_urls from pass 1
  const batchIds = listings.map(l => String(l.id))
  const { data: scrapeableRaw } = await supabase
    .from('listings')
    .select('id, name, website_url')
    .is('email', null)
    .not('website_url', 'is', null)
    .in('id', batchIds)

  const scrapeable = (scrapeableRaw || []).map(row => sanitiseListing(row as Record<string, unknown>))

  console.log(`[enrich-emails] Pass2: ${scrapeable.length} venues to scrape`)

  if (scrapeable.length > 0) {
    for (let i = 0; i < scrapeable.length; i++) {
      const listing = scrapeable[i]
      const entry: LogEntry = {
        id: String(listing.id),
        name: String(listing.name || ''),
        step: 'scrape',
        place_id_found: false,
        website_found: false,
        phone_found: false,
        email_found: false,
      }

      try {
        console.log(`[enrich-emails] Pass2 [${i}/${scrapeable.length}] id=${listing.id} url="${String(listing.website_url || '').slice(0, 80)}"`)
        const email = await findEmailFromWebsite(String(listing.website_url!))
        if (email) {
          await supabase
            .from('listings')
            .update({ email: safeString(email) })
            .eq('id', listing.id)
          entry.email_found = true
          emailFoundCount++
          console.log(`[enrich-emails]   Found email: ${safeString(email)}`)
        } else {
          console.log(`[enrich-emails]   No email found`)
        }
      } catch (err) {
        console.error(`[enrich-emails] *** SCRAPE FAILED Pass2 [${i}] id=${listing.id} name="${listing.name}":`, err)
        entry.error = safeError(err)
        entry.skipped = true
        errorCount++
        skippedCount++
      }

      log.push(entry)
      await sleep(1000) // rate limit
    }
  }

  // Safely build response — serialise each log entry individually
  const safeLog = log.map(safeLogEntry)

  console.log(`[enrich-emails] Building response: ${safeLog.length} log entries, ${errorCount} errors, ${skippedCount} skipped`)

  return jsonResponse({
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
    skipped: skippedCount,
    log: safeLog,
  })

  } catch (outerErr) {
    console.error('[enrich-emails] *** UNEXPECTED ROUTE ERROR:', outerErr)
    return jsonResponse(
      { error: `Unexpected error: ${safeError(outerErr)}` },
      500,
    )
  }
}
