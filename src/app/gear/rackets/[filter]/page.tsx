import { getSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 3600;

// SEO-friendly filter definitions
const FILTERS: Record<string, { title: string; description: string; query: (sb: any) => any }> = {
  // Price ranges
  'under-100': {
    title: 'Best Padel Rackets Under £100',
    description: 'Quality padel rackets that won\'t break the bank. Reviewed and recommended for UK players.',
    query: (sb: any) => sb.lt('price', '£100'),
  },
  'under-150': {
    title: 'Best Padel Rackets Under £150',
    description: 'Mid-range padel rackets with the best balance of performance and value.',
    query: (sb: any) => sb.lt('price', '£150'),
  },
  'under-200': {
    title: 'Best Padel Rackets Under £200',
    description: 'Premium padel rackets at accessible prices. Serious gear for committed players.',
    query: (sb: any) => sb.lt('price', '£200'),
  },
  'premium': {
    title: 'Best Premium Padel Rackets 2026',
    description: 'The highest-end padel rackets money can buy. Pro-level performance for serious players.',
    query: (sb: any) => sb.gte('price', '£200'),
  },
  // Shapes
  'round': {
    title: 'Best Round Padel Rackets — Control & Forgiveness',
    description: 'Round padel rackets for control players. Larger sweet spot, more forgiveness, ideal for beginners and defensive players.',
    query: (sb: any) => sb.eq('shape', 'Round'),
  },
  'diamond': {
    title: 'Best Diamond Padel Rackets — Power & Attack',
    description: 'Diamond-shaped padel rackets for aggressive players. Maximum power, high balance, devastating overheads.',
    query: (sb: any) => sb.eq('shape', 'Diamond'),
  },
  'teardrop': {
    title: 'Best Teardrop Padel Rackets — Versatile All-Rounders',
    description: 'Teardrop padel rackets that balance power and control. The most popular shape for intermediate players.',
    query: (sb: any) => sb.eq('shape', 'Teardrop'),
  },
  'hybrid': {
    title: 'Best Hybrid Padel Rackets 2026',
    description: 'Hybrid-shaped padel rackets combining the best of round and diamond designs.',
    query: (sb: any) => sb.eq('shape', 'Hybrid'),
  },
  // Brands
  'bullpadel': {
    title: 'Best Bullpadel Rackets 2026 — Full Range Reviewed',
    description: 'Every Bullpadel racket reviewed. From the Hack 04 to the Vertex 05 — find the right one for your game.',
    query: (sb: any) => sb.eq('brand', 'Bullpadel'),
  },
  'adidas': {
    title: 'Best Adidas Padel Rackets 2026 — Metalbone & More',
    description: 'The complete Adidas padel racket range. Metalbone, Arrow Hit, Cross It — all reviewed.',
    query: (sb: any) => sb.eq('brand', 'Adidas'),
  },
  'nox': {
    title: 'Best Nox Padel Rackets 2026 — AT10 & ML10 Range',
    description: 'Nox padel rackets reviewed. The brand trusted by Agustín Tapia and Miguel Lamperti.',
    query: (sb: any) => sb.eq('brand', 'Nox'),
  },
  'head': {
    title: 'Best Head Padel Rackets 2026 — Complete Guide',
    description: 'Head padel rackets from entry-level to Arturo Coello\'s pro model. All reviewed for UK players.',
    query: (sb: any) => sb.eq('brand', 'Head'),
  },
  'babolat': {
    title: 'Best Babolat Padel Rackets 2026 — Viper & More',
    description: 'Babolat padel rackets reviewed. The brand behind Juan Lebrón\'s Viper series.',
    query: (sb: any) => sb.eq('brand', 'Babolat'),
  },
  'wilson': {
    title: 'Best Wilson Padel Rackets 2026 — Bela & Defy Range',
    description: 'Wilson padel rackets reviewed. Belasteguín\'s signature line and the new Defy series.',
    query: (sb: any) => sb.eq('brand', 'Wilson'),
  },
  'siux': {
    title: 'Best Siux Padel Rackets 2026 — Diablo & More',
    description: 'Siux padel rackets reviewed. Great value for money with the Diablo and Fenix ranges.',
    query: (sb: any) => sb.eq('brand', 'Siux'),
  },
  // Gender
  'women': {
    title: 'Best Women\'s Padel Rackets 2026',
    description: 'Padel rackets designed for women. Lighter weights, optimised grips, top performance.',
    query: (sb: any) => sb.eq('gender', 'women'),
  },
  // On sale
  'deals': {
    title: 'Padel Racket Deals & Discounts — UK 2026',
    description: 'The best padel racket deals right now. Sale prices from top brands.',
    query: (sb: any) => sb.not('compare_price', 'is', null),
  },
};

// Shape descriptions for editorial content
const SHAPE_INTROS: Record<string, string> = {
  'Round': 'Round rackets have the largest sweet spot centred in the middle of the face. This makes them the most forgiving shape — off-centre hits still fly true. They favour control and consistency over raw power, making them ideal for beginners learning the basics and defensive players who build points from the back of the court.',
  'Diamond': 'Diamond rackets concentrate weight at the top of the frame, delivering maximum power on overheads and smashes. The sweet spot sits higher, meaning you need cleaner technique to connect properly. These are for aggressive players with solid fundamentals who want to end points from the net.',
  'Teardrop': 'Teardrop rackets sit between round and diamond — a versatile middle ground that works for most playing styles. The sweet spot is slightly raised compared to round rackets, offering a good blend of power and control. This is the most popular shape for intermediate players who want one racket that does everything reasonably well.',
  'Hybrid': 'Hybrid rackets blend characteristics from multiple shapes, typically combining a round-like sweet spot with slightly more weight distribution towards the head. They offer an interesting middle ground for players who want forgiveness but with a touch more attacking capability.',
};

type Props = { params: Promise<{ filter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { filter } = await params;
  const f = FILTERS[filter];
  if (!f) return {};
  return { title: f.title, description: f.description };
}

export default async function RacketFilterPage({ params }: Props) {
  const supabase = getSupabase();
  const { filter } = await params;
  const f = FILTERS[filter];
  if (!f) notFound();

  // Build query
  let query = supabase
    .from('gear_products')
    .select('*')
    .eq('category', 'rackets');

  // Apply filter (price filters need special handling)
  if (filter.startsWith('under-')) {
    const maxPrice = parseInt(filter.replace('under-', ''));
    // Price is stored as "£123" — we need to filter client-side
    const { data: allRackets } = await query.order('name');
    const products = (allRackets || []).filter(p => {
      const num = parseInt((p.price || '0').replace(/[^0-9]/g, ''));
      return num > 0 && num < maxPrice;
    });
    return renderPage(f, filter, products);
  } else if (filter === 'premium') {
    const { data: allRackets } = await query.order('name');
    const products = (allRackets || []).filter(p => {
      const num = parseInt((p.price || '0').replace(/[^0-9]/g, ''));
      return num >= 200;
    });
    return renderPage(f, filter, products);
  } else if (filter === 'deals') {
    const { data } = await query.not('compare_price', 'is', null).order('name');
    return renderPage(f, filter, data || []);
  } else if (['round', 'diamond', 'teardrop', 'hybrid'].includes(filter)) {
    const shape = filter.charAt(0).toUpperCase() + filter.slice(1);
    const { data } = await query.eq('shape', shape).order('name');
    return renderPage(f, filter, data || []);
  } else if (filter === 'women') {
    const { data } = await query.eq('gender', 'women').order('name');
    return renderPage(f, filter, data || []);
  } else {
    // Brand filter
    const brand = filter.charAt(0).toUpperCase() + filter.slice(1);
    const { data } = await query.eq('brand', brand).order('name');
    return renderPage(f, filter, data || []);
  }
}

function renderPage(f: { title: string; description: string }, filter: string, products: any[]) {
  const shape = ['round', 'diamond', 'teardrop', 'hybrid'].includes(filter) ? filter.charAt(0).toUpperCase() + filter.slice(1) : null;
  const shapeIntro = shape ? SHAPE_INTROS[shape] : null;

  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <a href="/gear" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← Gear</a>
        <div className="label-caps mt-6">Rackets</div>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight md:text-4xl">{f.title}</h1>
        <p className="mt-4 max-w-2xl text-sm text-pm-muted leading-relaxed">{f.description}</p>
        {shapeIntro && (
          <p className="mt-3 max-w-2xl text-sm text-pm-muted leading-relaxed">{shapeIntro}</p>
        )}
        <p className="mt-3 text-xs text-pm-faint">{products.length} rackets</p>
      </section>

      {/* Product grid with images */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-pm-muted text-sm">No rackets found for this filter.</p>
          <a href="/gear/shop" className="mt-2 text-xs text-pm-accent hover:underline">Browse all products →</a>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product: any) => (
            <a
              key={product.id}
              href={product.affiliate_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="group block rounded-2xl border border-pm-border/40 bg-white overflow-hidden hover:border-pm-accent/30 hover:shadow-sm transition-all"
            >
              <div className="aspect-square bg-pm-bg-card p-4 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-pm-ash text-3xl">🎾</div>
                )}
              </div>
              <div className="p-3.5">
                {product.brand && (
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint">{product.brand}</div>
                )}
                <h3 className="mt-1 text-sm font-medium text-pm-text leading-tight line-clamp-2 group-hover:text-pm-accent transition-colors">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-pm-text">{product.price}</span>
                  {product.compare_price && product.compare_price !== product.price && (
                    <span className="text-xs text-pm-faint line-through">{product.compare_price}</span>
                  )}
                </div>
                {product.shape && (
                  <div className="mt-1.5 text-[10px] text-pm-faint">{product.shape} shape</div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Quiz CTA */}
      <section className="mt-10 rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-8 text-center">
        <h3 className="font-serif text-xl font-semibold tracking-tight">Not sure which to pick?</h3>
        <p className="mt-2 text-sm text-pm-muted max-w-md mx-auto">
          Take our 30-second quiz and we'll recommend the perfect racket for your level and style.
        </p>
        <a href="/quiz" className="mt-4 btn-primary inline-block text-sm">Take the quiz →</a>
      </section>

      {/* Related filters */}
      <section className="mt-10">
        <h3 className="font-serif text-lg font-semibold tracking-tight mb-4">Browse by</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(FILTERS).filter(([k]) => k !== filter).slice(0, 12).map(([key, val]) => (
            <a key={key} href={`/gear/rackets/${key}`} className="rounded-full border border-pm-border px-4 py-2 text-xs text-pm-muted hover:bg-pm-bg-hover hover:text-pm-text transition-all">
              {val.title.replace('Best ', '').replace(' 2026', '').replace(' — Full Range Reviewed', '').replace(' — Complete Guide', '')}
            </a>
          ))}
        </div>
      </section>

      {/* Affiliate disclosure */}
      <section className="mt-8 rounded-xl border border-pm-border/40 bg-pm-bg-card px-6 py-4">
        <p className="text-xs leading-relaxed text-pm-faint">
          Prices from Padel Market and may vary. When you buy through links on this page,
          Padel Manual earns a small affiliate commission at no extra cost to you.
        </p>
      </section>
    </main>
  );
}
