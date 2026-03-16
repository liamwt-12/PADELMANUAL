import { getSupabase } from '@/lib/supabase';
import GearShopClient from './GearShopClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Padel Gear Shop — Rackets, Shoes, Bags & More',
  description: 'Browse 1,400+ padel products from top brands. Rackets, shoes, bags, balls, clothing and accessories with prices and expert picks.',
};

export const revalidate = 3600;

export default async function GearShopPage() {
  const supabase = getSupabase();
  const cols = 'id, name, slug, brand, category, price, compare_price, image, product_url, affiliate_url, shape, gender, featured';
  const [{ data: p1 }, { data: p2 }] = await Promise.all([
    supabase.from('gear_products').select(cols).order('category').order('name').range(0, 999),
    supabase.from('gear_products').select(cols).order('category').order('name').range(1000, 2999),
  ]);
  const products = [...(p1 || []), ...(p2 || [])];

  // Get unique brands and categories
  const brands = [...new Set((products || []).map(p => p.brand).filter(Boolean))].sort();
  const categories = [...new Set((products || []).map(p => p.category).filter(Boolean))].sort();

  return <GearShopClient products={products || []} brands={brands} categories={categories} />;
}
