import { getGearBySlug, gearItems } from "@/lib/gear";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const gear = getGearBySlug(slug);
  if (!gear) return {};
  return { title: gear.title, description: gear.headline };
}

export default async function GearPage({ params }: Props) {
  const { slug } = await params;
  const gear = getGearBySlug(slug);
  if (!gear) notFound();

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

      {/* Quiz CTA */}
      <section className="mt-10 rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-8 text-center">
        <h3 className="font-serif text-xl font-semibold tracking-tight">Not sure which to pick?</h3>
        <p className="mt-2 text-sm text-pm-muted max-w-md mx-auto">
          Take our 30-second quiz and we'll recommend the perfect racket for your level and style.
        </p>
        <a href="/quiz" className="mt-4 btn-primary inline-block text-sm">Take the quiz →</a>
      </section>

      {/* Shop CTA */}
      <section className="mt-6 rounded-xl border border-pm-border/40 bg-pm-bg-card p-6 text-center">
        <p className="text-sm text-pm-muted">
          Browse all {gear.category} →{' '}
          <a href="/gear/shop" className="text-pm-accent hover:text-pm-text transition-colors font-medium">
            Shop 1,400+ products
          </a>
        </p>
      </section>

      {/* Affiliate disclosure */}
      <section className="mt-6 rounded-xl border border-pm-border/40 bg-pm-bg-card p-6">
        <p className="text-xs leading-relaxed text-pm-faint">
          Padel Manual is reader-supported. When you buy through links on this page, we earn a small
          affiliate commission from Padel Market at no extra cost to you. We only recommend products
          we would genuinely use ourselves.
        </p>
      </section>

      {/* More guides */}
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
