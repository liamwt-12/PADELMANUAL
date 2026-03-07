import { createClient } from '@supabase/supabase-js';
import GearShopClient from './GearShopClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Padel Gear Shop — Rackets, Shoes, Bags & More',
  description: 'Browse 1,400+ padel products from top brands. Rackets, shoes, bags, balls, clothing and accessories with prices and expert picks.',
};

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function GearShopPage() {
  const { data: products } = await supabase
    .from('gear_products')
    .select('*')
    .order('category')
    .order('name');

  // Get unique brands and categories
  const brands = [...new Set((products || []).map(p => p.brand).filter(Boolean))].sort();
  const categories = [...new Set((products || []).map(p => p.category).filter(Boolean))].sort();

  return <GearShopClient products={products || []} brands={brands} categories={categories} />;
}
