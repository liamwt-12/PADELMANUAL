import { getSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 3600;

const FILTERS: Record<string, { title: string; description: string; where: Record<string, string> }> = {
  'all': { title: 'Best Padel Shoes UK 2026', description: 'Every padel shoe reviewed. Find the right fit for your game.', where: {} },
  'men': { title: 'Best Men\'s Padel Shoes 2026', description: 'Padel shoes designed for men. Grip, support, and durability for every court surface.', where: { gender: 'unisex' } },
  'women': { title: 'Best Women\'s Padel Shoes 2026', description: 'Padel shoes for women. Lighter builds, better fits, top performance.', where: { gender: 'women' } },
  'asics': { title: 'Best Asics Padel Shoes 2026', description: 'Asics padel shoes reviewed. Gel cushioning and herringbone grip.', where: { brand: 'Asics' } },
  'head': { title: 'Best Head Padel Shoes 2026', description: 'Head padel shoes reviewed. Designed specifically for padel court movement.', where: { brand: 'Head' } },
  'adidas': { title: 'Best Adidas Padel Shoes 2026', description: 'Adidas padel shoes reviewed. Adiwear durability and Adiprene cushioning.', where: { brand: 'Adidas' } },
  'bullpadel': { title: 'Best Bullpadel Shoes 2026', description: 'Bullpadel shoes reviewed. Premium padel footwear from Spain.', where: { brand: 'Bullpadel' } },
  'wilson': { title: 'Best Wilson Padel Shoes 2026', description: 'Wilson padel shoes reviewed. Quality and value from a trusted brand.', where: { brand: 'Wilson' } },
  'babolat': { title: 'Best Babolat Padel Shoes 2026', description: 'Babolat padel shoes reviewed. French engineering for the padel court.', where: { brand: 'Babolat' } },
  'joma': { title: 'Best Joma Padel Shoes 2026', description: 'Joma padel shoes reviewed. Exceptional value from the Spanish specialist.', where: { brand: 'Joma' } },
  'deals': { title: 'Padel Shoe Deals & Sales UK 2026', description: 'The best padel shoe deals right now. Discounted prices from top brands.', where: {} },
};

type Props = { params: Promise<{ filter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { filter } = await params;
  const f = FILTERS[filter];
  if (!f) return {};
  return { title: f.title, description: f.description };
}

export default async function ShoeFilterPage({ params }: Props) {
  const supabase = getSupabase();
  const { filter } = await params;
  const f = FILTERS[filter];
  if (!f) notFound();

  let query = supabase.from('gear_products').select('*').eq('category', 'shoes');
  
  if (f.where.brand) query = query.eq('brand', f.where.brand);
  if (f.where.gender) query = query.eq('gender', f.where.gender);
  if (filter === 'deals') query = query.not('compare_price', 'is', null);
  
  const { data: products } = await query.order('name');

  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <a href="/gear" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← Gear</a>
        <div className="label-caps mt-6">Shoes</div>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight md:text-4xl">{f.title}</h1>
        <p className="mt-4 max-w-2xl text-sm text-pm-muted leading-relaxed">{f.description}</p>
        <p className="mt-3 text-xs text-pm-faint">{(products || []).length} shoes</p>
      </section>

      {(products || []).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-pm-muted text-sm">No shoes found.</p>
          <a href="/gear/shop" className="mt-2 text-xs text-pm-accent hover:underline">Browse all products →</a>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {(products || []).map((p: any) => (
            <a key={p.id} href={p.affiliate_url} target="_blank" rel="noopener noreferrer nofollow" className="group block rounded-2xl border border-pm-border/40 bg-white overflow-hidden hover:border-pm-accent/30 hover:shadow-sm transition-all">
              <div className="aspect-square bg-pm-bg-card p-4 flex items-center justify-center overflow-hidden">
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" /> : <div className="text-pm-ash text-3xl">👟</div>}
              </div>
              <div className="p-3.5">
                {p.brand && <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint">{p.brand}</div>}
                <h3 className="mt-1 text-sm font-medium text-pm-text leading-tight line-clamp-2 group-hover:text-pm-accent transition-colors">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-pm-text">{p.price}</span>
                  {p.compare_price && p.compare_price !== p.price && <span className="text-xs text-pm-faint line-through">{p.compare_price}</span>}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <section className="mt-10">
        <h3 className="font-serif text-lg font-semibold tracking-tight mb-4">Browse by</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(FILTERS).filter(([k]) => k !== filter).map(([key, val]) => (
            <a key={key} href={`/gear/shoes/${key}`} className="rounded-full border border-pm-border px-4 py-2 text-xs text-pm-muted hover:bg-pm-bg-hover hover:text-pm-text transition-all">
              {val.title.replace('Best ', '').replace(' 2026', '')}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-pm-border/40 bg-pm-bg-card px-6 py-4">
        <p className="text-xs leading-relaxed text-pm-faint">Prices from Padel Market. When you buy through links on this page, Padel Manual earns a small affiliate commission at no extra cost to you.</p>
      </section>
    </main>
  );
}
