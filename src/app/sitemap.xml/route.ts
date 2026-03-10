import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE = 'https://www.padelmanual.com';

export async function GET() {
  const { data: listings } = await supabase
    .from('listings')
    .select('slug, city')
    .not('slug', 'is', null);

  const cities = [...new Set((listings || []).map(l => l.city).filter(Boolean))];

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

  const staticPages = [
    { url: '', priority: '1.0', freq: 'daily' },
    { url: '/find', priority: '0.9', freq: 'daily' },
    { url: '/gear', priority: '0.8', freq: 'weekly' },
    { url: '/gear/shop', priority: '0.8', freq: 'daily' },
    { url: '/quiz', priority: '0.7', freq: 'monthly' },
    { url: '/demo', priority: '0.6', freq: 'monthly' },
    // Editorial guides
    { url: '/guides/padel-vs-tennis', priority: '0.8', freq: 'monthly' },
    { url: '/guides/padel-cost-uk', priority: '0.8', freq: 'monthly' },
    { url: '/guides/padel-rules', priority: '0.8', freq: 'monthly' },
    { url: '/guides/what-to-wear', priority: '0.7', freq: 'monthly' },
    // Gear guides (editorial)
    { url: '/gear/best-padel-rackets-uk', priority: '0.8', freq: 'monthly' },
    { url: '/gear/best-padel-shoes-uk', priority: '0.7', freq: 'monthly' },
    { url: '/gear/best-padel-balls-uk', priority: '0.7', freq: 'monthly' },
    { url: '/gear/best-padel-bags-uk', priority: '0.7', freq: 'monthly' },
    // Racket filters
    ...['under-100', 'under-150', 'under-200', 'premium', 'round', 'diamond', 'teardrop', 'hybrid',
        'bullpadel', 'adidas', 'nox', 'head', 'babolat', 'wilson', 'siux', 'women', 'deals'
    ].map(f => ({ url: `/gear/rackets/${f}`, priority: '0.7', freq: 'weekly' })),
    // Shoe filters
    ...['all', 'men', 'women', 'asics', 'head', 'adidas', 'bullpadel', 'wilson', 'babolat', 'joma', 'deals'
    ].map(f => ({ url: `/gear/shoes/${f}`, priority: '0.7', freq: 'weekly' })),
    // Bag filters
    ...['all', 'adidas', 'bullpadel', 'head', 'nox', 'wilson', 'deals'
    ].map(f => ({ url: `/gear/bags/${f}`, priority: '0.7', freq: 'weekly' })),
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of staticPages) {
    xml += `  <url><loc>${BASE}${page.url}</loc><lastmod>${now}</lastmod><changefreq>${page.freq}</changefreq><priority>${page.priority}</priority></url>\n`;
  }

  for (const listing of (listings || [])) {
    if (!listing.slug) continue;
    xml += `  <url><loc>${BASE}/${listing.slug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
  }

  for (const city of cities) {
    xml += `  <url><loc>${BASE}/city/${encodeURIComponent(city!.toLowerCase())}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  }

  for (const area of postcodeAreas) {
    xml += `  <url><loc>${BASE}/courts/${area!.toLowerCase()}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
