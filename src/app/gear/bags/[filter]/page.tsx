import { getSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 3600;

const FILTERS: Record<string, { title: string; description: string; brand?: string }> = {
  'all': { title: 'Best Padel Bags UK 2026', description: 'Every padel bag reviewed. Racket bags, backpacks, and paleteros from top brands.' },
  'adidas': { title: 'Best Adidas Padel Bags 2026', description: 'Adidas padel bags reviewed. Control and Racket Bag ranges.', brand: 'Adidas' },
  'bullpadel': { title: 'Best Bullpadel Bags 2026', description: 'Bullpadel bags reviewed. Premium paleteros and backpacks.', brand: 'Bullpadel' },
  'head': { title: 'Best Head Padel Bags 2026', description: 'Head padel bags reviewed. Core and Tour ranges.', brand: 'Head' },
  'nox': { title: 'Best Nox Padel Bags 2026', description: 'Nox padel bags reviewed. AT10 and ML10 bag collections.', brand: 'Nox' },
  'wilson': { title: 'Best Wilson Padel Bags 2026', description: 'Wilson padel bags reviewed. Super Tour and Team ranges.', brand: 'Wilson' },
  'deals': { title: 'Padel Bag Deals & Sales UK 2026', description: 'The best padel bag deals right now.' },
};

type Props = { params: Promise<{ filter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { filter } = await params;
  const f = FILTERS[filter];
  if (!f) return {};
  return { title: f.title, description: f.description };
}

export default async function BagFilterPage({ params }: Props) {
  const supabase = getSupabase();
  const { filter } = await params;
  const f = FILTERS[filter];
  if (!f) notFound();

  let query = supabase.from('gear_products').select('*').eq('category', 'bags');
  if (f.brand) query = query.eq('brand', f.brand);
  if (filter === 'deals') query = query.not('compare_price', 'is', null);
  const { data: products } = await query.order('name');

  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <a href="/gear" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← Gear</a>
        <div className="label-caps mt-6">Bags</div>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight md:text-4xl">{f.title}</h1>
        <p className="mt-4 max-w-2xl text-sm text-pm-muted leading-relaxed">{f.description}</p>
        <p className="mt-3 text-xs text-pm-faint">{(products || []).length} bags</p>
      </section>

      {(products || []).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-pm-muted text-sm">No bags found.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {(products || []).map((p: any) => (
            <a key={p.id} href={p.affiliate_url} target="_blank" rel="noopener noreferrer nofollow" className="group block rounded-2xl border border-pm-border/40 bg-white overflow-hidden hover:border-pm-accent/30 hover:shadow-sm transition-all">
              <div className="aspect-square bg-pm-bg-card p-4 flex items-center justify-center overflow-hidden">
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" /> : <div className="text-pm-ash text-3xl">🎒</div>}
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
            <a key={key} href={`/gear/bags/${key}`} className="rounded-full border border-pm-border px-4 py-2 text-xs text-pm-muted hover:bg-pm-bg-hover hover:text-pm-text transition-all">
              {val.title.replace('Best ', '').replace(' 2026', '')}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-pm-border/40 bg-pm-bg-card px-6 py-4">
        <p className="text-xs leading-relaxed text-pm-faint">Prices from Padel Market. Padel Manual earns a small affiliate commission at no extra cost to you.</p>
      </section>
    </main>
  );
}
