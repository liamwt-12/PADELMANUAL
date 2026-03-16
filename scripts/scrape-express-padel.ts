/**
 * Scrape Express Padel product catalogue via Shopify JSON API
 * and upsert into Supabase gear_products table.
 *
 * Usage:
 *   npx tsx scripts/scrape-express-padel.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

// ── Config ──

const AFFILIATE_BASE = 'https://go.adt246.net/t/t?a=1976016007&as=2056350206&t=2&tk=1'
const EXPRESS_PADEL_BASE = 'https://www.expresspadel.co.uk'

const COLLECTIONS: { handle: string; category: string }[] = [
  { handle: 'padel-rackets', category: 'rackets' },
  { handle: 'padel-balls', category: 'balls' },
  { handle: 'bags', category: 'bags' },
  { handle: 'shoes', category: 'shoes' },
  { handle: 'clothing', category: 'clothing' },
  { handle: 'padel-accessories', category: 'accessories' },
  { handle: 'padel-grips', category: 'grips' },
]

// ── Types ──

interface ShopifyVariant {
  price: string
  compare_at_price: string | null
  available: boolean
  grams: number
}

interface ShopifyImage {
  src: string
  position: number
}

interface ShopifyProduct {
  id: number
  title: string
  handle: string
  vendor: string
  product_type: string
  body_html: string
  tags: string[]
  variants: ShopifyVariant[]
  images: ShopifyImage[]
}

interface GearProductRow {
  name: string
  brand: string | null
  category: string
  price: string
  compare_price: string | null
  image: string | null
  images: string[]
  product_url: string
  express_padel_url: string
  affiliate_url: string
  slug: string
  description: string | null
  specs: Record<string, string> | null
  in_stock: boolean
  shape: string | null
  gender: string
}

// ── Helpers ──

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractSpecs(bodyHtml: string): Record<string, string> {
  const specs: Record<string, string> = {}
  if (!bodyHtml) return specs

  const patterns: { key: string; regex: RegExp }[] = [
    { key: 'shape', regex: /Racket\s*shape\s*:\s*<\/strong>\s*([^<\n]+)/i },
    { key: 'ability', regex: /Ability\s*:\s*<\/strong>\s*([^<\n]+)/i },
    { key: 'designed_for', regex: /Designed\s*for\s*:\s*<\/strong>\s*([^<\n]+)/i },
    { key: 'weight', regex: /Weight\s*:\s*<\/strong>\s*([^<\n]+)/i },
    { key: 'balance', regex: /Balance\s*:\s*<\/strong>\s*([^<\n]+)/i },
    { key: 'frame', regex: /Frame\s*:\s*<\/strong>\s*([^<\n]+)/i },
    { key: 'surface', regex: /Surface\s*:\s*<\/strong>\s*([^<\n]+)/i },
    { key: 'core', regex: /Core\s*:\s*<\/strong>\s*([^<\n]+)/i },
    { key: 'thickness', regex: /Thickness\s*:\s*<\/strong>\s*([^<\n]+)/i },
  ]

  for (const { key, regex } of patterns) {
    const match = bodyHtml.match(regex)
    if (match) {
      specs[key] = match[1].trim()
    }
  }

  return specs
}

function extractShape(specs: Record<string, string>): string | null {
  const raw = specs.shape?.toLowerCase() || ''
  if (raw.includes('round')) return 'Round'
  if (raw.includes('diamond')) return 'Diamond'
  if (raw.includes('teardrop') || raw.includes('hybrid')) return 'Teardrop'
  return specs.shape || null
}

function formatPrice(price: string): string {
  const num = parseFloat(price)
  if (isNaN(num)) return price
  return `£${num.toFixed(2)}`
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function fetchCollection(handle: string): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = []
  let page = 1

  while (true) {
    const url = `${EXPRESS_PADEL_BASE}/collections/${handle}/products.json?limit=250&page=${page}`
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`  Failed to fetch ${url}: ${res.status}`)
      break
    }
    const data = await res.json()
    if (!data.products || data.products.length === 0) break
    products.push(...data.products)
    if (data.products.length < 250) break
    page++
    await sleep(500)
  }

  return products
}

function buildRow(product: ShopifyProduct, category: string): GearProductRow {
  const variant = product.variants[0]
  const specs = extractSpecs(product.body_html)
  const expressUrl = `${EXPRESS_PADEL_BASE}/products/${product.handle}`
  const affiliateUrl = `${AFFILIATE_BASE}&url=${encodeURIComponent(expressUrl)}`

  // Weight from variant grams if not in specs
  if (!specs.weight && variant?.grams && variant.grams > 0) {
    specs.weight = `${variant.grams}g`
  }

  const anyAvailable = product.variants.some(v => v.available)

  return {
    name: product.title,
    brand: product.vendor || null,
    category,
    price: formatPrice(variant?.price || '0'),
    compare_price: variant?.compare_at_price ? formatPrice(variant.compare_at_price) : null,
    image: product.images[0]?.src || null,
    images: product.images.map(i => i.src),
    product_url: expressUrl,
    express_padel_url: expressUrl,
    affiliate_url: affiliateUrl,
    slug: toSlug(product.title),
    description: product.body_html ? stripHtml(product.body_html) : null,
    specs: Object.keys(specs).length > 0 ? specs : null,
    in_stock: anyAvailable,
    shape: extractShape(specs),
    gender: 'unisex',
  }
}

// ── Main ──

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  // Fetch existing Express Padel URLs for skip check
  const { data: existing } = await supabase
    .from('gear_products')
    .select('express_padel_url')
    .not('express_padel_url', 'is', null)

  const existingUrls = new Set((existing || []).map(r => r.express_padel_url))

  // Track used slugs (from DB + this run)
  const { data: allSlugs } = await supabase
    .from('gear_products')
    .select('slug')

  const usedSlugs = new Set((allSlugs || []).map(r => r.slug))

  let totalFetched = 0
  let totalInserted = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const { handle, category } of COLLECTIONS) {
    console.log(`\n── ${category} (${handle}) ──`)
    const products = await fetchCollection(handle)
    console.log(`  Fetched ${products.length} products`)
    totalFetched += products.length

    for (const product of products) {
      const row = buildRow(product, category)

      // Skip if already exists
      if (existingUrls.has(row.express_padel_url)) {
        totalSkipped++
        continue
      }

      // Ensure unique slug
      let slug = row.slug
      let suffix = 2
      while (usedSlugs.has(slug)) {
        slug = `${row.slug}-${suffix}`
        suffix++
      }
      row.slug = slug
      usedSlugs.add(slug)

      const { error } = await supabase
        .from('gear_products')
        .insert(row)

      if (error) {
        // Could be a race condition duplicate — try update
        if (error.code === '23505') {
          totalSkipped++
        } else {
          console.error(`  ERROR inserting "${row.name}": ${error.message}`)
          totalErrors++
        }
      } else {
        totalInserted++
        existingUrls.add(row.express_padel_url)
      }

      await sleep(100) // light rate limit for DB writes
    }

    console.log(`  Done: inserted so far ${totalInserted}, skipped ${totalSkipped}`)
    await sleep(500) // rate limit between collections
  }

  console.log('\n════════════════════════════════')
  console.log(`Total fetched:  ${totalFetched}`)
  console.log(`Total inserted: ${totalInserted}`)
  console.log(`Total skipped:  ${totalSkipped}`)
  console.log(`Total errors:   ${totalErrors}`)
  console.log('════════════════════════════════')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
