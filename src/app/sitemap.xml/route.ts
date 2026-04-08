import { getSupabase } from '@/lib/supabase';
import { STATIONS } from '@/lib/stations';
import { UK_STATIONS } from '@/lib/uk-stations';
import { CITY_GUIDE_SLUGS } from '@/app/guides/padel-[city]/cities';

const BASE = 'https://www.padelmanual.com';

export async function GET() {
  const supabase = getSupabase();
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

  // Gear product slugs
  const { data: gearProducts } = await supabase
    .from('gear_products')
    .select('slug')
    .not('slug', 'is', null);

  const staticPages = [
    { url: '', priority: '1.0', freq: 'daily' },
    { url: '/find', priority: '0.9', freq: 'daily' },
    { url: '/gear', priority: '0.8', freq: 'weekly' },
    { url: '/gear/shop', priority: '0.8', freq: 'daily' },
    // Gear category index pages
    { url: '/gear/rackets', priority: '0.8', freq: 'weekly' },
    { url: '/gear/balls', priority: '0.7', freq: 'weekly' },
    { url: '/gear/shoes', priority: '0.7', freq: 'weekly' },
    { url: '/gear/bags', priority: '0.7', freq: 'weekly' },
    { url: '/gear/clothing', priority: '0.7', freq: 'weekly' },
    { url: '/gear/accessories', priority: '0.7', freq: 'weekly' },
    { url: '/quiz', priority: '0.7', freq: 'monthly' },
    { url: '/demo', priority: '0.6', freq: 'monthly' },
    // Editorial guides
    { url: '/guides/padel-vs-tennis', priority: '0.8', freq: 'monthly' },
    { url: '/guides/padel-cost-uk', priority: '0.8', freq: 'monthly' },
    { url: '/guides/padel-rules', priority: '0.8', freq: 'monthly' },
    { url: '/guides/what-to-wear', priority: '0.7', freq: 'monthly' },
    { url: '/guides/padel-near-me', priority: '0.8', freq: 'monthly' },
    { url: '/guides/padel-rules-beginners', priority: '0.8', freq: 'monthly' },
    { url: '/guides/padel-vs-pickleball', priority: '0.7', freq: 'monthly' },
    { url: '/guides/how-to-start-playing-padel', priority: '0.8', freq: 'monthly' },
    { url: '/guides/find-padel-courts-near-me', priority: '0.8', freq: 'monthly' },
    { url: '/guides/how-much-does-padel-cost', priority: '0.8', freq: 'monthly' },
    { url: '/guides/best-padel-rackets-beginners-uk', priority: '0.8', freq: 'monthly' },
    // Hyperlocal city guides (25 cities)
    ...CITY_GUIDE_SLUGS.map(slug => ({
      url: `/guides/padel-${slug}`,
      priority: '0.8',
      freq: 'weekly',
    })),
    // Play Today
    { url: '/play-today', priority: '0.9', freq: 'daily' },
    ...['london', 'manchester', 'birmingham', 'bristol', 'leeds', 'edinburgh', 'glasgow', 'brighton', 'nottingham', 'liverpool']
      .map(c => ({ url: `/play-today/${c}`, priority: '0.8', freq: 'daily' })),
    // News & pricing
    { url: '/padel-news/openings-closures', priority: '0.8', freq: 'weekly' },
    { url: '/padel-costs', priority: '0.8', freq: 'weekly' },
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
    const citySlug = encodeURIComponent(city!.toLowerCase().replace(/\s+/g, '-'));
    xml += `  <url><loc>${BASE}/city/${encodeURIComponent(city!.toLowerCase())}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
    xml += `  <url><loc>${BASE}/padel/${citySlug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  }

  // Padel index page
  xml += `  <url><loc>${BASE}/padel</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;

  for (const area of postcodeAreas) {
    xml += `  <url><loc>${BASE}/courts/${area!.toLowerCase()}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
    xml += `  <url><loc>${BASE}/padel/area/${area!.toLowerCase()}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
  }

  // Also add numbered postcode variants (SW1, SW2, etc.) from listings
  const numberedAreas = [...new Set(
    (postcodeData || [])
      .map(p => p.postcode?.match(/^[A-Z]{1,2}\d{1,2}/i)?.[0]?.toLowerCase())
      .filter(Boolean)
  )];
  for (const na of numberedAreas) {
    xml += `  <url><loc>${BASE}/padel/area/${na}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
  }

  // Filter pages (indoor/outdoor × top cities)
  const filterCities = ['london', 'manchester', 'birmingham', 'bristol', 'leeds', 'edinburgh', 'glasgow', 'brighton', 'nottingham', 'liverpool'];
  for (const fc of filterCities) {
    xml += `  <url><loc>${BASE}/padel/${fc}/indoor</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
    xml += `  <url><loc>${BASE}/padel/${fc}/outdoor</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  }

  // Tube station pages
  for (const station of STATIONS) {
    xml += `  <url><loc>${BASE}/padel/near/${station.slug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  }

  // UK train station pages
  xml += `  <url><loc>${BASE}/padel/station</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  for (const station of UK_STATIONS) {
    xml += `  <url><loc>${BASE}/padel/station/${station.slug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
  }

  // Gear product pages
  for (const product of (gearProducts || [])) {
    if (!product.slug) continue;
    xml += `  <url><loc>${BASE}/gear/${product.slug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>\n`;
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
