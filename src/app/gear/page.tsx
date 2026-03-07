import { gearItems } from "@/lib/gear";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Padel Gear Guides & Shop",
  description: "Curated gear reviews and 1,400+ products for UK padel players. Rackets, shoes, bags, balls and more.",
};

export default function GearIndex() {
  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <h1 className="font-serif text-4xl font-bold tracking-tight">Gear</h1>
        <p className="mt-4 max-w-lg text-pm-muted">
          Curated reviews and 1,400+ products from top brands. We test, compare,
          and recommend — so you don&apos;t waste money on hype.
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

      {/* Editorial guides */}
      <section>
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
        <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight">1,400+ products</h2>
        <p className="mt-2 text-sm text-pm-muted max-w-md mx-auto">
          Rackets, shoes, bags, balls, clothing and accessories from Bullpadel,
          Adidas, Nox, Head, Babolat, Wilson, and more.
        </p>
        <a href="/gear/shop" className="mt-5 btn-primary inline-block text-sm">
          Browse the shop →
        </a>
      </section>
    </main>
  );
}
