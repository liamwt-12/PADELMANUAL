import { getSupabase } from '@/lib/supabase';

export default async function GearShowcase() {
  const supabase = getSupabase();
  // Get 4 featured rackets with images
  const { data: products } = await supabase
    .from('gear_products')
    .select('id, name, brand, price, compare_price, image, affiliate_url')
    .eq('category', 'rackets')
    .not('image', 'is', null)
    .order('name')
    .limit(50);

  // Pick 4 from different brands
  const seen = new Set<string>();
  const featured: typeof products = [];
  for (const p of (products || [])) {
    if (p.brand && !seen.has(p.brand) && featured.length < 4) {
      seen.add(p.brand);
      featured.push(p);
    }
  }

  if (featured.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Trending rackets</h2>
          <p className="mt-1 text-sm text-pm-faint">From the shop — 282 rackets, 4 brands, every price point</p>
        </div>
        <a href="/gear/shop" className="text-xs font-medium text-pm-accent hover:text-pm-text transition-colors">
          Shop all →
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {featured.map((p: any) => (
          <a
            key={p.id}
            href={p.affiliate_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="group block rounded-2xl border border-pm-border/40 bg-white overflow-hidden hover:border-pm-accent/30 hover:shadow-sm transition-all"
          >
            <div className="aspect-square bg-pm-bg-card p-5 flex items-center justify-center overflow-hidden">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint">{p.brand}</div>
              <h3 className="mt-1 text-xs font-medium text-pm-text leading-tight line-clamp-2 group-hover:text-pm-accent transition-colors">
                {p.name}
              </h3>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-sm font-semibold text-pm-text">{p.price}</span>
                {p.compare_price && p.compare_price !== p.price && (
                  <span className="text-[10px] text-pm-faint line-through">{p.compare_price}</span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
