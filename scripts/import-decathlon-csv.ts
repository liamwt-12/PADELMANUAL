/**
 * Import Decathlon padel products from CSV into gear_products table.
 *
 * Usage:
 *   npx tsx scripts/import-decathlon-csv.ts [path-to-csv]
 *
 * Defaults to scripts/decathlon-products.csv if no path given.
 *
 * CSV columns:
 *   name, price_pence, category, description, image_url, product_url, brand
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

// ── Config ──

const AWIN_ID = '2799632'
const DECATHLON_AWIN_MID = '26895'
const AFFILIATE_BASE = `https://www.awin1.com/cread.php?awinmid=${DECATHLON_AWIN_MID}&awinaffid=${AWIN_ID}&ued=`

// ── Helpers ──

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = parseCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim()
    })

    // Skip rows with no name
    if (!row.name) continue
    rows.push(row)
  }

  return rows
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)
  return values
}

// ── Main ──

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const csvPath = process.argv[2]
    ? resolve(process.argv[2])
    : resolve(__dirname, 'decathlon-products.csv')

  let csvContent: string
  try {
    csvContent = readFileSync(csvPath, 'utf-8')
  } catch {
    console.error(`Could not read CSV file: ${csvPath}`)
    console.error('Usage: npx tsx scripts/import-decathlon-csv.ts [path-to-csv]')
    process.exit(1)
  }

  const rows = parseCsv(csvContent)
  console.log(`Parsed ${rows.length} products from ${csvPath}`)

  if (rows.length === 0) {
    console.error('No products found in CSV')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  // Fetch existing Decathlon URLs to skip duplicates
  const { data: existing } = await supabase
    .from('gear_products')
    .select('decathlon_url, product_url')
    .eq('source', 'decathlon')

  const existingUrls = new Set(
    (existing || []).flatMap(r => [r.decathlon_url, r.product_url].filter(Boolean))
  )

  // Track used slugs
  const { data: allSlugs } = await supabase
    .from('gear_products')
    .select('slug')

  const usedSlugs = new Set((allSlugs || []).map(r => r.slug))

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const row of rows) {
    const productUrl = row.product_url
    const affiliateUrl = `${AFFILIATE_BASE}${encodeURIComponent(productUrl)}`

    // Skip if already exists
    if (existingUrls.has(affiliateUrl) || existingUrls.has(productUrl)) {
      console.log(`  SKIP (exists): ${row.name}`)
      skipped++
      continue
    }

    const pricePence = parseInt(row.price_pence, 10)
    if (isNaN(pricePence)) {
      console.error(`  ERROR: invalid price for "${row.name}": ${row.price_pence}`)
      errors++
      continue
    }

    // Generate unique slug
    let slug = toSlug(row.name)
    let suffix = 2
    while (usedSlugs.has(slug)) {
      slug = `${toSlug(row.name)}-${suffix}`
      suffix++
    }
    usedSlugs.add(slug)

    const dbRow = {
      name: row.name,
      brand: row.brand || 'Decathlon',
      category: row.category,
      price: formatPrice(pricePence),
      compare_price: null,
      image: row.image_url || null,
      images: row.image_url ? [row.image_url] : [],
      product_url: productUrl,
      decathlon_url: affiliateUrl,
      affiliate_url: affiliateUrl,
      slug,
      description: row.description || null,
      specs: null,
      in_stock: true,
      shape: null,
      gender: 'unisex',
      source: 'decathlon',
    }

    const { error } = await supabase
      .from('gear_products')
      .insert(dbRow)

    if (error) {
      if (error.code === '23505') {
        console.log(`  SKIP (duplicate): ${row.name}`)
        skipped++
      } else {
        console.error(`  ERROR inserting "${row.name}": ${error.message}`)
        errors++
      }
    } else {
      console.log(`  OK: ${row.name} → ${slug}`)
      inserted++
      existingUrls.add(affiliateUrl)
    }
  }

  console.log('\n════════════════════════════════')
  console.log(`Total in CSV:   ${rows.length}`)
  console.log(`Inserted:       ${inserted}`)
  console.log(`Skipped:        ${skipped}`)
  console.log(`Errors:         ${errors}`)
  console.log('════════════════════════════════')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
