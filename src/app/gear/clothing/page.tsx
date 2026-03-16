import { getSupabase } from '@/lib/supabase';
import ProductGrid from '@/components/ProductGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Padel Clothing 2026 | Buy Online',
  description: 'Browse padel clothing — shirts, shorts, skirts, and outerwear from top brands.',
};

export const revalidate = 3600;

export default async function ClothingPage() {
  const supabase = getSupabase();
  const { data: products } = await supabase
    .from('gear_products')
    .select('id, name, slug, brand, price, compare_price, image, affiliate_url, shape')
    .eq('category', 'clothing')
    .order('name');

  return (
    <main className="pb-10">
      <section className="pb-6 pt-6">
        <a href="/gear" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← Gear</a>
        <h1 className="mt-5 font-serif text-4xl font-bold tracking-tight">Padel Clothing</h1>
        <p className="mt-3 text-sm text-pm-muted">{(products || []).length} items from top brands</p>
      </section>

      <ProductGrid products={products || []} />

      <section className="mt-8 rounded-xl border border-pm-border/40 bg-pm-bg-card px-6 py-4">
        <p className="text-xs leading-relaxed text-pm-faint">
          Prices from Express Padel and Padel Market. When you buy through links on this page,
          Padel Manual earns a small affiliate commission at no extra cost to you.
        </p>
      </section>
    </main>
  );
}
