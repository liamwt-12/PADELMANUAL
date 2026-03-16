import { gearItems } from "@/lib/gear";
import { getSupabase } from "@/lib/supabase";
import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";

export const metadata: Metadata = {
  title: "Padel Gear — Rackets, Shoes, Bags & More",
  description: "Everything you need to play padel. Browse 1,600+ products from Express Padel and Padel Market, plus expert gear guides.",
};

export const revalidate = 3600;

const CATEGORIES = [
  { key: "rackets", label: "Rackets", href: "/gear/rackets", emoji: "🏓" },
  { key: "shoes", label: "Shoes", href: "/gear/shoes", emoji: "👟" },
  { key: "balls", label: "Balls", href: "/gear/balls", emoji: "🎾" },
  { key: "bags", label: "Bags", href: "/gear/bags", emoji: "🎒" },
  { key: "clothing", label: "Clothing", href: "/gear/clothing", emoji: "👕" },
  { key: "accessories", label: "Accessories", href: "/gear/accessories", emoji: "🔧" },
];

export default async function GearIndex() {
  const supabase = getSupabase();

  // Category counts
  const { data: allProducts } = await supabase
    .from("gear_products")
    .select("category");

  const counts: Record<string, number> = {};
  (allProducts || []).forEach((p) => {
    const cat = p.category === "grips" ? "accessories" : p.category;
    counts[cat] = (counts[cat] || 0) + 1;
  });
  const totalProducts = (allProducts || []).length;

  // Featured products (rackets with images, featured flag or just pick diverse brands)
  const { data: featuredRaw } = await supabase
    .from("gear_products")
    .select("id, name, slug, brand, price, compare_price, image, affiliate_url, shape")
    .eq("category", "rackets")
    .not("image", "is", null)
    .order("name")
    .limit(50);

  const seen = new Set<string>();
  const featured: typeof featuredRaw = [];
  for (const p of featuredRaw || []) {
    if (p.brand && !seen.has(p.brand) && featured.length < 3) {
      seen.add(p.brand);
      featured.push(p);
    }
  }

  // New arrivals
  const { data: newArrivals } = await supabase
    .from("gear_products")
    .select("id, name, slug, brand, price, compare_price, image, affiliate_url, shape")
    .not("image", "is", null)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <h1 className="font-serif text-4xl font-bold tracking-tight">Padel Gear</h1>
        <p className="mt-4 max-w-lg text-pm-muted">
          Everything you need to play padel, sourced from Express Padel and Padel Market.
          {" "}{totalProducts.toLocaleString()} products across {Object.keys(counts).length} categories.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/gear/shop" className="btn-primary text-sm">
            Browse all products →
          </a>
          <a href="/quiz" className="btn-secondary text-sm">
            Take the racket quiz
          </a>
        </div>
      </section>

      {/* Category cards */}
      <section>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.key}
              href={cat.href}
              className="card block group"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <div className="mt-3 font-serif text-lg font-semibold tracking-tight group-hover:text-pm-accent transition-colors">
                {cat.label}
              </div>
              <p className="mt-1 text-xs text-pm-faint">{counts[cat.key] || 0} products</p>
              <div className="mt-3 text-xs font-medium text-pm-accent">Shop →</div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured rackets */}
      {featured.length > 0 && (
        <section className="mt-12">
          <div className="label-caps mb-5 text-pm-accent">Featured rackets</div>
          <ProductGrid products={featured} />
        </section>
      )}

      {/* New arrivals */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="mt-12">
          <div className="label-caps mb-5">New arrivals</div>
          <ProductGrid products={newArrivals} />
        </section>
      )}

      {/* Expert guides */}
      <section className="mt-12">
        <div className="label-caps mb-4">Expert guides</div>
        <div className="grid gap-3 md:grid-cols-2">
          {gearItems.map((g) => (
            <a key={g.slug} href={`/gear/${g.slug}`} className="card block">
              <div className="label-caps">{g.category}</div>
              <div className="mt-3 font-serif text-xl font-semibold tracking-tight">{g.title}</div>
              <p className="mt-2 text-sm text-pm-muted">{g.headline}</p>
              <div className="mt-2 text-sm text-pm-faint">{g.products.length} products reviewed</div>
              <div className="mt-4 text-xs font-medium text-pm-faint">Read guide →</div>
            </a>
          ))}
        </div>
      </section>

      {/* Shop CTA */}
      <section className="mt-10 rounded-2xl border border-pm-border/60 bg-pm-bg-card p-8 md:p-10 text-center">
        <div className="label-caps">Shop</div>
        <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight">{totalProducts.toLocaleString()}+ products</h2>
        <p className="mt-2 text-sm text-pm-muted max-w-md mx-auto">
          Rackets, shoes, bags, balls, clothing and accessories from Babolat,
          Head, Bullpadel, Adidas, Wilson, Dunlop, Nox, and more.
        </p>
        <a href="/gear/shop" className="mt-5 btn-primary inline-block text-sm">
          Browse the shop →
        </a>
      </section>
    </main>
  );
}
