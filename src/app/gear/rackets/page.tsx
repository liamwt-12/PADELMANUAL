import { getSupabase } from '@/lib/supabase';
import ProductGrid from '@/components/ProductGrid';
import RetailerFilter from '@/components/RetailerFilter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Padel Rackets 2026 | Buy Online',
  description: 'Browse 100+ padel rackets from Babolat, Head, Bullpadel, Wilson, Adidas, and more. Prices, specs, and expert picks for UK players.',
};

export const revalidate = 3600;

const BRAND_FILTERS = ['All', 'Babolat', 'Head', 'Bullpadel', 'Wilson', 'Adidas', 'Dunlop', 'Nox', 'Siux'];

export default async function RacketsPage({
  searchParams,
}: {
  searchParams: Promise<{ retailer?: string }>;
}) {
  const { retailer } = await searchParams;
  const supabase = getSupabase();

  let query = supabase
    .from('gear_products')
    .select('id, name, slug, brand, price, compare_price, image, affiliate_url, shape, source')
    .eq('category', 'rackets')
    .order('name');

  if (retailer === 'express_padel' || retailer === 'decathlon') {
    query = query.eq('source', retailer);
  }

  const { data: products } = await query;
  const allProducts = products || [];
  const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();

  return (
    <main className="pb-10">
      <section className="pb-6 pt-6">
        <a href="/gear" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← Gear</a>
        <h1 className="mt-5 font-serif text-4xl font-bold tracking-tight">Padel Rackets</h1>
        <p className="mt-3 text-sm text-pm-muted">{allProducts.length} rackets from top brands</p>
      </section>

      <RetailerFilter currentRetailer={retailer} basePath="/gear/rackets" />

      {/* Brand filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {BRAND_FILTERS.filter(b => b === 'All' || brands.includes(b)).map(brand => (
          <a
            key={brand}
            href={brand === 'All' ? '/gear/rackets' : `/gear/rackets/${brand.toLowerCase()}`}
            className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border border-pm-border/60 text-pm-muted hover:bg-pm-bg-hover hover:text-pm-text transition-all"
          >
            {brand}
          </a>
        ))}
      </div>

      <ProductGrid products={allProducts} />

      <section className="mt-8 rounded-xl border border-pm-border/40 bg-pm-bg-card px-6 py-4">
        <p className="text-xs leading-relaxed text-pm-faint">
          Prices from Express Padel, Decathlon, and Padel Market. When you buy through links on this page,
          Padel Manual earns a small affiliate commission at no extra cost to you.
        </p>
      </section>
    </main>
  );
}
