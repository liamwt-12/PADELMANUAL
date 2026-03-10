import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE = 'https://www.padelmanual.com';

export async function GET() {
  // Fetch all listing slugs
  const { data: listings } = await supabase
    .from('listings')
    .select('slug, city')
    .not('slug', 'is', null);

  // Fetch all gear product slugs  
  const { data: gearProducts } = await supabase
    .from('gear_products')
    .select('slug')
    .not('slug', 'is', null);

  // Get unique cities for city pages
  const cities = [...new Set((listings || []).map(l => l.city).filter(Boolean))];

  // Get unique postcode prefixes
  const { data: postcodeData } = await supabase
    .from('listings')
    .select('postcode')
    .not('postcode', 'is', null);

  const postcodeAreas = [...new Set(
    (postcodeData || [])
      .map(p => p.postcode?.match(/^[A-Z]{1,2}/i)?.[0]?.toUpperCase())
      .filter(Boolean)
  )];

  const now = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { url: '', priority: '1.0', freq: 'daily' },
    { url: '/find', priority: '0.9', freq: 'daily' },
    { url: '/gear', priority: '0.8', freq: 'weekly' },
    { url: '/gear/shop', priority: '0.8', freq: 'daily' },
    { url: '/quiz', priority: '0.7', freq: 'monthly' },
    { url: '/demo', priority: '0.6', freq: 'monthly' },
    { url: '/weekly', priority: '0.6', freq: 'weekly' },
    // Editorial articles
    { url: '/guides/padel-vs-tennis', priority: '0.8', freq: 'monthly' },
    { url: '/guides/padel-cost-uk', priority: '0.8', freq: 'monthly' },
    // Gear guides
    { url: '/gear/best-padel-rackets-uk', priority: '0.8', freq: 'monthly' },
    { url: '/gear/best-padel-shoes-uk', priority: '0.7', freq: 'monthly' },
    { url: '/gear/best-padel-balls-uk', priority: '0.7', freq: 'monthly' },
    { url: '/gear/best-padel-bags-uk', priority: '0.7', freq: 'monthly' },
    // Racket filter pages
    { url: '/gear/rackets/under-100', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/under-150', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/under-200', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/premium', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/round', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/diamond', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/teardrop', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/hybrid', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/bullpadel', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/adidas', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/nox', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/head', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/babolat', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/wilson', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/siux', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/women', priority: '0.7', freq: 'weekly' },
    { url: '/gear/rackets/deals', priority: '0.7', freq: 'daily' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static pages
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE}${page.url}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.freq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Venue/coach listing pages
  for (const listing of (listings || [])) {
    if (!listing.slug) continue;
    xml += `  <url>\n`;
    xml += `    <loc>${BASE}/${listing.slug}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }

  // City pages
  for (const city of cities) {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE}/city/${encodeURIComponent(city!.toLowerCase())}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  // Postcode area pages
  for (const area of postcodeAreas) {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE}/courts/${area!.toLowerCase()}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
