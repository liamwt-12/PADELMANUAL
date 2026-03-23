import { getSupabase } from '@/lib/supabase';
import ProductGrid from '@/components/ProductGrid';
import RetailerFilter from '@/components/RetailerFilter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Padel Bags 2026 | Buy Online',
  description: 'Browse padel bags, racket covers and backpacks from top brands. Find the right bag for your game.',
};

export const revalidate = 3600;

export default async function BagsPage({
  searchParams,
}: {
  searchParams: Promise<{ retailer?: string }>;
}) {
  const { retailer } = await searchParams;
  const supabase = getSupabase();

  let query = supabase
    .from('gear_products')
    .select('id, name, slug, brand, price, compare_price, image, affiliate_url, shape, source')
    .eq('category', 'bags')
    .order('name');

  if (retailer === 'express_padel' || retailer === 'decathlon') {
    query = query.eq('source', retailer);
  }

  const { data: products } = await query;

  return (
    <main className="pb-10">
      <section className="pb-6 pt-6">
        <a href="/gear" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← Gear</a>
        <h1 className="mt-5 font-serif text-4xl font-bold tracking-tight">Padel Bags</h1>
        <p className="mt-3 text-sm text-pm-muted">{(products || []).length} bags from top brands</p>
      </section>

      <RetailerFilter currentRetailer={retailer} basePath="/gear/bags" />

      <ProductGrid products={products || []} />

      <section className="mt-8 rounded-xl border border-pm-border/40 bg-pm-bg-card px-6 py-4">
        <p className="text-xs leading-relaxed text-pm-faint">
          Prices from Express Padel, Decathlon, and Padel Market. When you buy through links on this page,
          Padel Manual earns a small affiliate commission at no extra cost to you.
        </p>
      </section>
    </main>
  );
}
