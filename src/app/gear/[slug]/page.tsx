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
        <div className="label-caps">{gear.category}</div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">{gear.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-pm-muted">{gear.headline}</p>
      </section>
      <section className="mb-10 max-w-2xl"><p className="text-sm leading-relaxed text-pm-muted">{gear.intro}</p></section>
      <div className="space-y-4">
        {gear.products.map((product, i) => (
          <div key={product.name} className="rounded-2xl border border-pm-border/60 bg-pm-bg-card p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">#{i + 1} · {product.brand}</div>
                <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight">{product.name}</h2>
                <div className="mt-1 text-sm font-medium text-pm-accent">{product.price}</div>
              </div>
              <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary whitespace-nowrap text-[13px]">View on Amazon</a>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Our verdict</div><p className="mt-2 text-sm leading-relaxed text-pm-muted">{product.verdict}</p></div>
              <div><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Best for</div><p className="mt-2 text-sm leading-relaxed text-pm-muted">{product.bestFor}</p></div>
            </div>
          </div>
        ))}
      </div>
      <section className="mt-10 rounded-2xl border border-pm-border/40 bg-pm-bg-card p-6">
        <p className="text-xs leading-relaxed text-pm-faint">Padel Manual is reader-supported. When you buy through links on this page, we may earn a small affiliate commission at no extra cost to you. We only recommend products we would genuinely use ourselves.</p>
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
