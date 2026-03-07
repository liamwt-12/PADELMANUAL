'use client';

import { useState, useMemo } from 'react';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  category: string;
  price: string | null;
  compare_price: string | null;
  image: string | null;
  product_url: string;
  affiliate_url: string;
  shape: string | null;
  gender: string;
  featured: boolean;
}

interface Props {
  products: Product[];
  brands: string[];
  categories: string[];
}

const categoryLabels: Record<string, string> = {
  rackets: 'Rackets',
  shoes: 'Shoes',
  bags: 'Bags',
  balls: 'Balls',
  clothing: 'Clothing',
  accessories: 'Accessories',
  grips: 'Grips',
};

const categoryOrder = ['rackets', 'shoes', 'balls', 'bags', 'clothing', 'accessories', 'grips'];

export default function GearShopClient({ products, brands, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('rackets');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedShape, setSelectedShape] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');

  const sortedCategories = categoryOrder.filter(c => categories.includes(c));

  const filtered = useMemo(() => {
    let result = products.filter(p => p.category === selectedCategory);

    if (selectedBrand) result = result.filter(p => p.brand === selectedBrand);
    if (selectedShape) result = result.filter(p => p.shape === selectedShape);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price-low' || sortBy === 'price-high') {
      result.sort((a, b) => {
        const pa = parseFloat((a.price || '0').replace(/[^0-9.]/g, ''));
        const pb = parseFloat((b.price || '0').replace(/[^0-9.]/g, ''));
        return sortBy === 'price-low' ? pa - pb : pb - pa;
      });
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, selectedBrand, selectedShape, search, sortBy]);

  // Get brands for selected category
  const categoryBrands = useMemo(() => {
    const b = [...new Set(products.filter(p => p.category === selectedCategory).map(p => p.brand).filter(Boolean))].sort();
    return b as string[];
  }, [products, selectedCategory]);

  // Get shapes for rackets
  const shapes = useMemo(() => {
    if (selectedCategory !== 'rackets') return [];
    return [...new Set(products.filter(p => p.category === 'rackets' && p.shape).map(p => p.shape))].sort() as string[];
  }, [products, selectedCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [products]);

  return (
    <main className="pb-10">
      {/* Header */}
      <section className="pb-6 pt-6">
        <div className="label-caps">Shop</div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">Padel gear</h1>
        <p className="mt-3 max-w-lg text-sm text-pm-muted leading-relaxed">
          {products.length.toLocaleString()} products from top brands.
          Every link supports Padel Manual at no extra cost to you.
        </p>
      </section>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
        {sortedCategories.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setSelectedBrand(''); setSelectedShape(''); }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-pm-text text-white'
                : 'bg-pm-bg-card border border-pm-border/60 text-pm-muted hover:bg-pm-bg-hover'
            }`}
          >
            {categoryLabels[cat] || cat}
            <span className="ml-1.5 text-xs opacity-60">{categoryCounts[cat] || 0}</span>
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-[300px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pm-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent placeholder:text-pm-ash"
          />
        </div>

        {/* Brand filter */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="px-3 py-2 text-sm border border-pm-border rounded-xl bg-white text-pm-text focus:outline-none focus:border-pm-accent"
        >
          <option value="">All brands</option>
          {categoryBrands.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Shape filter (rackets only) */}
        {shapes.length > 0 && (
          <select
            value={selectedShape}
            onChange={(e) => setSelectedShape(e.target.value)}
            className="px-3 py-2 text-sm border border-pm-border rounded-xl bg-white text-pm-text focus:outline-none focus:border-pm-accent"
          >
            <option value="">All shapes</option>
            {shapes.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 text-sm border border-pm-border rounded-xl bg-white text-pm-text focus:outline-none focus:border-pm-accent"
        >
          <option value="name">A–Z</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </div>

      {/* Results count */}
      <div className="text-xs text-pm-faint mb-4">
        {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        {selectedBrand && <> by {selectedBrand}</>}
        {selectedShape && <> · {selectedShape} shape</>}
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-pm-muted text-sm">No products found</p>
          <button
            onClick={() => { setSelectedBrand(''); setSelectedShape(''); setSearch(''); }}
            className="mt-2 text-xs text-pm-accent hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <a
              key={product.id}
              href={product.affiliate_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="group block rounded-2xl border border-pm-border/40 bg-white overflow-hidden hover:border-pm-accent/30 hover:shadow-sm transition-all"
            >
              {/* Image */}
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

              {/* Details */}
              <div className="p-3.5">
                {product.brand && (
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint">
                    {product.brand}
                  </div>
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

      {/* Affiliate disclosure */}
      <section className="mt-10 rounded-xl border border-pm-border/40 bg-pm-bg-card px-6 py-4">
        <p className="text-xs leading-relaxed text-pm-faint">
          Prices shown are from Padel Market and may vary. When you buy through links on this page,
          Padel Manual earns a small affiliate commission at no extra cost to you.
          We only feature products from retailers we trust.
        </p>
      </section>
    </main>
  );
}
