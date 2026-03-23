/**
 * Scrape Decathlon UK padel product catalogue and upsert into
 * Supabase gear_products table.
 *
 * Usage:
 *   npx tsx scripts/scrape-decathlon.ts
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

const AWIN_ID = '2799632'
const DECATHLON_AWIN_MID = '26895'
const DECATHLON_BASE = 'https://www.decathlon.co.uk'
const AFFILIATE_BASE = `https://www.awin1.com/cread.php?awinmid=${DECATHLON_AWIN_MID}&awinaffid=${AWIN_ID}&ued=`

// Decathlon padel category pages to scrape
const CATEGORY_URLS: { path: string; category: string }[] = [
  { path: '/sports/padel/padel-rackets', category: 'rackets' },
  { path: '/sports/padel/padel-balls', category: 'balls' },
  { path: '/sports/padel/padel-shoes', category: 'shoes' },
  { path: '/sports/padel/padel-bags', category: 'bags' },
  { path: '/sports/padel/padel-clothing', category: 'clothing' },
  { path: '/sports/padel/padel-accessories', category: 'accessories' },
]

// ── Types ──

interface DecathlonProduct {
  id: string
  name: string
  brand: string
  price: number         // in pounds
  comparePrice: number | null
  image: string | null
  images: string[]
  productUrl: string
  description: string | null
  inStock: boolean
  category: string
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
  decathlon_url: string
  affiliate_url: string
  slug: string
  description: string | null
  specs: Record<string, string> | null
  in_stock: boolean
  shape: string | null
  gender: string
  source: string
}

// ── Helpers ──

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

function formatPricePounds(pounds: number): string {
  return `£${pounds.toFixed(2)}`
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

// ── Scraping strategies ──

/**
 * Strategy 1: Decathlon's internal API (used by their frontend)
 * They expose product data as JSON in script tags or via XHR endpoints
 */
async function fetchCategoryProducts(path: string, category: string): Promise<DecathlonProduct[]> {
  const products: DecathlonProduct[] = []

  // Try the category page and extract product data from embedded JSON
  const url = `${DECATHLON_BASE}${path}`
  console.log(`  Fetching ${url}`)

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-GB,en;q=0.9',
    },
  })

  if (!res.ok) {
    console.error(`  Failed to fetch ${url}: ${res.status}`)
    return products
  }

  const html = await res.text()

  // Strategy 1: Look for __NEXT_DATA__ (Next.js data)
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1])
      const extracted = extractFromNextData(nextData, category)
      if (extracted.length > 0) {
        console.log(`  Found ${extracted.length} products via __NEXT_DATA__`)
        return extracted
      }
    } catch (e) {
      console.log(`  Could not parse __NEXT_DATA__: ${e}`)
    }
  }

  // Strategy 2: Look for product data in JSON-LD
  const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1])
      if (data['@type'] === 'ItemList' && data.itemListElement) {
        for (const item of data.itemListElement) {
          const product = item.item || item
          if (product.name && product.offers) {
            const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers
            const productUrl = product.url?.startsWith('http') ? product.url : `${DECATHLON_BASE}${product.url || ''}`
            products.push({
              id: product.sku || product.productID || '',
              name: product.name,
              brand: product.brand?.name || 'Decathlon',
              price: parseFloat(offer.price || '0'),
              comparePrice: null,
              image: product.image?.[0] || product.image || null,
              images: Array.isArray(product.image) ? product.image : product.image ? [product.image] : [],
              productUrl,
              description: product.description || null,
              inStock: offer.availability?.includes('InStock') ?? true,
              category,
            })
          }
        }
      }
    } catch {
      // skip invalid JSON-LD
    }
  }

  if (products.length > 0) {
    console.log(`  Found ${products.length} products via JSON-LD`)
    return products
  }

  // Strategy 3: Parse product cards from HTML
  const productCards = extractFromHtml(html, category)
  if (productCards.length > 0) {
    console.log(`  Found ${productCards.length} products via HTML parsing`)
    return productCards
  }

  console.log(`  No products found on ${path}`)
  return products
}

function extractFromNextData(data: any, category: string): DecathlonProduct[] {
  const products: DecathlonProduct[] = []

  // Walk the data structure looking for product arrays
  function walk(obj: any) {
    if (!obj || typeof obj !== 'object') return
    if (Array.isArray(obj)) {
      for (const item of obj) walk(item)
      return
    }

    // Check if this looks like a product object
    if (obj.name && (obj.price !== undefined || obj.offers || obj.pricing)) {
      const pricing = obj.pricing || obj.price || obj.offers
      let price = 0
      let comparePrice: number | null = null

      if (typeof pricing === 'number') {
        price = pricing
      } else if (typeof pricing === 'object') {
        price = pricing.price || pricing.currentPrice || pricing.salePrice || 0
        comparePrice = pricing.comparePrice || pricing.wasPrice || pricing.originalPrice || null
      }

      const productUrl = obj.url || obj.href || obj.pdpUrl || ''
      const fullUrl = productUrl.startsWith('http') ? productUrl : `${DECATHLON_BASE}${productUrl}`

      products.push({
        id: String(obj.id || obj.skuId || obj.productId || obj.code || ''),
        name: obj.name || obj.title || '',
        brand: obj.brand?.name || obj.brand || obj.vendor || 'Decathlon',
        price: typeof price === 'number' && price > 500 ? price / 100 : price, // handle pence vs pounds
        comparePrice: comparePrice ? (typeof comparePrice === 'number' && comparePrice > 500 ? comparePrice / 100 : comparePrice) : null,
        image: obj.image?.url || obj.image?.src || (typeof obj.image === 'string' ? obj.image : null) || obj.mainImage || null,
        images: [],
        productUrl: fullUrl,
        description: obj.description || null,
        inStock: obj.inStock ?? obj.available ?? obj.availability !== 'OutOfStock',
        category,
      })
    }

    // Recurse into nested objects
    for (const key of Object.keys(obj)) {
      if (['products', 'items', 'results', 'data', 'props', 'pageProps', 'dehydratedState', 'queries'].includes(key)) {
        walk(obj[key])
      }
    }
  }

  walk(data)
  return products
}

function extractFromHtml(html: string, category: string): DecathlonProduct[] {
  const products: DecathlonProduct[] = []

  // Match product card patterns — Decathlon typically uses data attributes or aria-labels
  // Pattern: product links with data-product-id or similar
  const productPattern = /<a[^>]*href="(\/p\/[^"]+)"[^>]*>[\s\S]*?<\/a>/g
  const matches = html.matchAll(productPattern)

  for (const match of matches) {
    const cardHtml = match[0]
    const href = match[1]

    // Extract product name
    const nameMatch = cardHtml.match(/(?:aria-label|title)="([^"]+)"/) ||
                      cardHtml.match(/<h[23][^>]*>(.*?)<\/h[23]>/i) ||
                      cardHtml.match(/class="[^"]*product[^"]*name[^"]*"[^>]*>([^<]+)</)
    if (!nameMatch) continue

    // Extract price
    const priceMatch = cardHtml.match(/£([\d,.]+)/) ||
                       cardHtml.match(/data-price="([\d.]+)"/) ||
                       cardHtml.match(/"price":\s*([\d.]+)/)
    if (!priceMatch) continue

    const name = nameMatch[1].trim()
    const price = parseFloat(priceMatch[1].replace(',', ''))

    // Extract image
    const imgMatch = cardHtml.match(/src="(https:\/\/[^"]+(?:\.jpg|\.png|\.webp)[^"]*)"/) ||
                     cardHtml.match(/data-src="(https:\/\/[^"]+(?:\.jpg|\.png|\.webp)[^"]*)"/)

    // Extract brand from name (common pattern: "BRAND - Product Name" or "Product Name BRAND")
    let brand = 'Decathlon'
    const brandNames = ['Kuikma', 'Head', 'Babolat', 'Wilson', 'Adidas', 'Bullpadel', 'Nox', 'Asics', 'Joma', 'Dunlop']
    for (const b of brandNames) {
      if (name.toLowerCase().includes(b.toLowerCase())) {
        brand = b
        break
      }
    }

    products.push({
      id: href.replace(/^\/p\//, '').replace(/[^a-z0-9-]/gi, ''),
      name,
      brand,
      price,
      comparePrice: null,
      image: imgMatch ? imgMatch[1] : null,
      images: [],
      productUrl: `${DECATHLON_BASE}${href}`,
      description: null,
      inStock: true,
      category,
    })
  }

  return products
}

// ── Build DB row ──

function buildRow(product: DecathlonProduct): GearProductRow {
  const affiliateUrl = `${AFFILIATE_BASE}${encodeURIComponent(product.productUrl)}`

  return {
    name: product.name,
    brand: product.brand || null,
    category: product.category,
    price: formatPricePounds(product.price),
    compare_price: product.comparePrice ? formatPricePounds(product.comparePrice) : null,
    image: product.image,
    images: product.images.length > 0 ? product.images : product.image ? [product.image] : [],
    product_url: product.productUrl,
    decathlon_url: affiliateUrl,
    affiliate_url: affiliateUrl,
    slug: toSlug(product.name),
    description: product.description ? stripHtml(product.description) : null,
    specs: null,
    in_stock: product.inStock,
    shape: null,
    gender: 'unisex',
    source: 'decathlon',
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

  // Fetch existing Decathlon URLs for skip check
  const { data: existing } = await supabase
    .from('gear_products')
    .select('decathlon_url')
    .eq('source', 'decathlon')

  const existingUrls = new Set((existing || []).map(r => r.decathlon_url).filter(Boolean))

  // Track used slugs
  const { data: allSlugs } = await supabase
    .from('gear_products')
    .select('slug')

  const usedSlugs = new Set((allSlugs || []).map(r => r.slug))

  let totalFetched = 0
  let totalInserted = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const { path, category } of CATEGORY_URLS) {
    console.log(`\n── ${category} (${path}) ──`)
    const products = await fetchCategoryProducts(path, category)
    console.log(`  Fetched ${products.length} products`)
    totalFetched += products.length

    for (const product of products) {
      const row = buildRow(product)

      // Skip if already exists
      if (existingUrls.has(row.decathlon_url)) {
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
        if (error.code === '23505') {
          totalSkipped++
        } else {
          console.error(`  ERROR inserting "${row.name}": ${error.message}`)
          totalErrors++
        }
      } else {
        totalInserted++
        existingUrls.add(row.decathlon_url)
      }

      await sleep(100)
    }

    console.log(`  Done: inserted so far ${totalInserted}, skipped ${totalSkipped}`)
    await sleep(1000) // rate limit between categories
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
