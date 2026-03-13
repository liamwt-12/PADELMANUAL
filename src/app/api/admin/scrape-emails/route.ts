import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minute Vercel limit

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const CONTACT_PATHS = ['/contact', '/contact-us', '/about']

type Result = {
  id: string
  name: string
  url: string
  email: string | null
  status: 'found' | 'not_found' | 'timeout' | 'error'
  page?: string
}

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

async function scrapeEmailFromPage(url: string): Promise<{ email: string | null; page: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PadelManual/1.0 (UK padel venue directory, hello@padelmanual.com)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { email: null, page: url }

    const html = await res.text()

    // Prefer mailto: links
    const mailtoMatches = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi)
    if (mailtoMatches) {
      const mailtoEmails = mailtoMatches.map(m => m.replace(/^mailto:/i, ''))
      const best = pickBestEmail(mailtoEmails)
      if (best) return { email: best, page: url }
    }

    // Fall back to all emails on page
    const allEmails = [...new Set(html.match(EMAIL_RE) || [])]
    const best = pickBestEmail(allEmails)
    return { email: best, page: url }
  } catch (err) {
    const isTimeout = err instanceof DOMException && err.name === 'AbortError'
    if (isTimeout) throw new Error('timeout')
    throw err
  }
}

async function findEmail(websiteUrl: string): Promise<{ email: string | null; page: string; timedOut?: boolean }> {
  // Normalize URL
  let baseUrl = websiteUrl.trim()
  if (!baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl
  // Remove trailing slash
  baseUrl = baseUrl.replace(/\/+$/, '')

  // Try homepage
  try {
    const result = await scrapeEmailFromPage(baseUrl)
    if (result.email) return result
  } catch (err) {
    if (err instanceof Error && err.message === 'timeout') {
      return { email: null, page: baseUrl, timedOut: true }
    }
  }

  // Try contact pages
  let origin: string
  try {
    origin = new URL(baseUrl).origin
  } catch {
    return { email: null, page: baseUrl }
  }

  for (const path of CONTACT_PATHS) {
    try {
      const result = await scrapeEmailFromPage(`${origin}${path}`)
      if (result.email) return result
    } catch (err) {
      if (err instanceof Error && err.message === 'timeout') continue
    }
  }

  return { email: null, page: baseUrl }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  const adminSecret = request.headers.get('x-admin-secret') || request.headers.get('authorization')?.replace('Bearer ', '')
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Get all listings with website but no email
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, name, website_url')
    .is('email', null)
    .not('website_url', 'is', null)
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!listings || listings.length === 0) {
    return NextResponse.json({ message: 'No listings need email enrichment', processed: 0, found: 0, not_found: 0, errors: 0, results: [] })
  }

  const results: Result[] = []
  let found = 0
  let notFound = 0
  let errors = 0

  for (const listing of listings) {
    try {
      const { email, page, timedOut } = await findEmail(listing.website_url!)

      if (timedOut) {
        results.push({ id: listing.id, name: listing.name, url: listing.website_url!, email: null, status: 'timeout', page })
        errors++
      } else if (email) {
        // Store the found email
        await supabase
          .from('listings')
          .update({ email })
          .eq('id', listing.id)

        results.push({ id: listing.id, name: listing.name, url: listing.website_url!, email, status: 'found', page })
        found++
      } else {
        results.push({ id: listing.id, name: listing.name, url: listing.website_url!, email: null, status: 'not_found', page })
        notFound++
      }
    } catch (err) {
      results.push({ id: listing.id, name: listing.name, url: listing.website_url!, email: null, status: 'error', page: String(err) })
      errors++
    }

    // Rate limit: 1 second between venues
    await sleep(1000)
  }

  return NextResponse.json({
    processed: results.length,
    found,
    not_found: notFound,
    errors,
    results,
  })
}
