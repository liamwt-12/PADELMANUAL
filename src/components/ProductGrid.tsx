interface Product {
  id: string
  name: string
  slug: string
  brand: string | null
  price: string | null
  compare_price: string | null
  image: string | null
  affiliate_url: string
  shape: string | null
}

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-pm-muted text-sm">No products found.</p>
        <a href="/gear/shop" className="mt-2 text-xs text-pm-accent hover:underline">Browse all products →</a>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <a
          key={p.id}
          href={`/gear/${p.slug}`}
          className="group block rounded-2xl border border-pm-border/40 bg-white overflow-hidden hover:border-pm-accent/30 hover:shadow-sm transition-all"
        >
          <div className="aspect-square bg-pm-bg-card p-4 flex items-center justify-center overflow-hidden">
            {p.image ? (
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="text-pm-ash text-3xl">🎾</div>
            )}
          </div>
          <div className="p-3.5">
            {p.brand && (
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint">{p.brand}</div>
            )}
            <h3 className="mt-1 text-sm font-medium text-pm-text leading-tight line-clamp-2 group-hover:text-pm-accent transition-colors">
              {p.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-pm-text">{p.price}</span>
              {p.compare_price && p.compare_price !== p.price && (
                <span className="text-xs text-pm-faint line-through">{p.compare_price}</span>
              )}
            </div>
            {p.shape && (
              <div className="mt-1.5 text-[10px] text-pm-faint">{p.shape} shape</div>
            )}
          </div>
        </a>
      ))}
    </div>
  )
}
