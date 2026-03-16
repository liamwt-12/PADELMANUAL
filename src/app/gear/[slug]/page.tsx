import { getGearBySlug, gearItems } from "@/lib/gear";
import { getSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductImageGallery from "@/components/ProductImageGallery";
import BuyButton from "@/components/BuyButton";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

// ── Metadata ──

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Editorial guide?
  const gear = getGearBySlug(slug);
  if (gear) return { title: gear.title, description: gear.headline };

  // DB product?
  const supabase = getSupabase();
  const { data: product } = await supabase
    .from("gear_products")
    .select("name, description, image, affiliate_url, price, brand")
    .eq("slug", slug)
    .single();

  if (!product) return {};

  const desc = product.description
    ? product.description.split(/[.\n]/)[0] + "."
    : `Buy the ${product.name} from Express Padel.`;

  return {
    title: `${product.name} | Buy from Express Padel`,
    description: `Buy the ${product.name} from Express Padel. ${desc} Free delivery available.`,
    openGraph: {
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

// ── Page ──

// Category routes have their own pages — prevent [slug] from handling them
const CATEGORY_ROUTES = new Set(['rackets', 'balls', 'shoes', 'bags', 'clothing', 'accessories', 'grips', 'shop']);

export default async function GearPage({ params }: Props) {
  const { slug } = await params;

  // Category routes are handled by /gear/rackets/page.tsx etc.
  if (CATEGORY_ROUTES.has(slug)) notFound();

  // ── Editorial guide ──
  const gear = getGearBySlug(slug);
  if (gear) return <GuidePage gear={gear} slug={slug} />;

  // ── Product page ──
  const supabase = getSupabase();
  const { data: product } = await supabase
    .from("gear_products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  // Related: same category, different product, up to 3
  const { data: related } = await supabase
    .from("gear_products")
    .select("id, name, slug, brand, price, compare_price, image, affiliate_url")
    .eq("category", product.category)
    .neq("id", product.id)
    .not("image", "is", null)
    .limit(3);

  const specs = product.specs as Record<string, string> | null;
  const images: string[] = product.images?.length ? product.images : product.image ? [product.image] : [];
  const categoryLabel = product.category?.charAt(0).toUpperCase() + product.category?.slice(1);

  return (
    <main className="pb-10">
      {/* Breadcrumb */}
      <nav className="pt-6 pb-4 flex items-center gap-1.5 text-xs text-pm-faint">
        <a href="/gear" className="hover:text-pm-text transition-colors">Gear</a>
        <span>&rsaquo;</span>
        <a href={`/gear/${product.category}`} className="hover:text-pm-text transition-colors">{categoryLabel}</a>
        <span>&rsaquo;</span>
        <span className="text-pm-muted truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Product layout */}
      <div className="md:grid md:grid-cols-2 md:gap-10">
        {/* Left — images */}
        <ProductImageGallery images={images} name={product.name} />

        {/* Right — info */}
        <div className="mt-6 md:mt-0">
          <h1 className="font-serif text-3xl font-bold tracking-tight">{product.name}</h1>
          {product.brand && (
            <p className="mt-1.5 text-sm text-pm-muted">{product.brand}</p>
          )}

          {/* Price */}
          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-serif text-2xl font-bold text-pm-text">{product.price}</span>
            {product.compare_price && product.compare_price !== product.price && (
              <span className="text-base text-pm-faint line-through">{product.compare_price}</span>
            )}
          </div>

          {/* Buy button */}
          <div className="mt-6">
            <BuyButton
              affiliateUrl={product.affiliate_url}
              productId={product.id}
              productSlug={product.slug}
            />
          </div>

          {!product.in_stock && (
            <p className="mt-3 text-xs text-red-600 font-medium">Currently out of stock</p>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <section className="mt-10 border-t border-pm-border/30 pt-8">
          <div className="label-caps text-pm-accent mb-4">About this {product.category === "rackets" ? "racket" : "product"}</div>
          <div className="max-w-2xl whitespace-pre-wrap text-sm leading-[1.9] text-pm-muted">
            {product.description}
          </div>
        </section>
      )}

      {/* Specs */}
      {specs && Object.keys(specs).length > 0 && (
        <section className="mt-8 border-t border-pm-border/30 pt-8">
          <div className="label-caps mb-4">Specifications</div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-md">
            {Object.entries(specs).map(([key, val]) => (
              <div key={key}>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint">
                  {key.replace(/_/g, " ")}
                </dt>
                <dd className="mt-0.5 text-sm text-pm-text">{val}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Related products */}
      {related && related.length > 0 && (
        <section className="mt-10 border-t border-pm-border/30 pt-8">
          <div className="label-caps mb-5">You might also like</div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {related.map((p: any) => (
              <a
                key={p.id}
                href={`/gear/${p.slug}`}
                className="group block rounded-2xl border border-pm-border/40 bg-white overflow-hidden hover:border-pm-accent/30 hover:shadow-sm transition-all"
              >
                <div className="aspect-square bg-pm-bg-card p-4 flex items-center justify-center overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <div className="text-pm-ash text-3xl">🎾</div>
                  )}
                </div>
                <div className="p-3.5">
                  {p.brand && <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint">{p.brand}</div>}
                  <h3 className="mt-1 text-sm font-medium text-pm-text leading-tight line-clamp-2 group-hover:text-pm-accent transition-colors">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-pm-text">{p.price}</span>
                    {p.compare_price && p.compare_price !== p.price && (
                      <span className="text-xs text-pm-faint line-through">{p.compare_price}</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Affiliate disclosure */}
      <section className="mt-10 rounded-xl border border-pm-border/40 bg-pm-bg-card px-6 py-4">
        <p className="text-xs leading-relaxed text-pm-faint">
          Price shown is from Express Padel and may vary. When you buy through this link,
          Padel Manual earns a small affiliate commission at no extra cost to you.
        </p>
      </section>

      {/* JSON-LD Product structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
            image: images[0] || undefined,
            description: product.description || undefined,
            offers: {
              "@type": "Offer",
              price: (product.price || "").replace(/[^0-9.]/g, ""),
              priceCurrency: "GBP",
              availability: product.in_stock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              url: product.affiliate_url,
            },
          }),
        }}
      />
    </main>
  );
}

// ── Editorial guide renderer (unchanged logic) ──

function GuidePage({ gear, slug }: { gear: any; slug: string }) {
  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <a href="/gear" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← All gear guides</a>
        <div className="label-caps mt-6">{gear.category}</div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">{gear.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-pm-muted">{gear.headline}</p>
      </section>

      <section className="mb-10 max-w-2xl">
        <p className="text-sm leading-relaxed text-pm-muted">{gear.intro}</p>
      </section>

      <div className="space-y-4">
        {gear.products.map((product: any, i: number) => (
          <div key={product.name} className="rounded-2xl border border-pm-border/60 bg-pm-bg-card p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
                  #{i + 1} · {product.brand}
                </div>
                <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight">{product.name}</h2>
                <div className="mt-1 text-sm font-medium text-pm-accent">{product.price}</div>
              </div>
              <a
                href={product.url || product.amazonUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="btn-primary whitespace-nowrap text-[13px]"
              >
                View on Padel Market
              </a>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Our verdict</div>
                <p className="mt-2 text-sm leading-relaxed text-pm-muted">{product.verdict}</p>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Best for</div>
                <p className="mt-2 text-sm leading-relaxed text-pm-muted">{product.bestFor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-8 text-center">
        <h3 className="font-serif text-xl font-semibold tracking-tight">Not sure which to pick?</h3>
        <p className="mt-2 text-sm text-pm-muted max-w-md mx-auto">
          Take our 30-second quiz and we&apos;ll recommend the perfect racket for your level and style.
        </p>
        <a href="/quiz" className="mt-4 btn-primary inline-block text-sm">Take the quiz →</a>
      </section>

      <section className="mt-6 rounded-xl border border-pm-border/40 bg-pm-bg-card p-6 text-center">
        <p className="text-sm text-pm-muted">
          Browse all {gear.category} →{" "}
          <a href="/gear/shop" className="text-pm-accent hover:text-pm-text transition-colors font-medium">
            Shop 1,400+ products
          </a>
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-pm-border/40 bg-pm-bg-card p-6">
        <p className="text-xs leading-relaxed text-pm-faint">
          Padel Manual is reader-supported. When you buy through links on this page, we earn a small
          affiliate commission from Padel Market at no extra cost to you. We only recommend products
          we would genuinely use ourselves.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="font-serif text-xl font-semibold tracking-tight">More gear guides</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {gearItems.filter((g) => g.slug !== slug).map((g) => (
            <a key={g.slug} href={`/gear/${g.slug}`} className="card block">
              <div className="label-caps">{g.category}</div>
              <div className="mt-2 font-serif font-semibold tracking-tight">{g.title}</div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
