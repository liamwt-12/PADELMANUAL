import { gearItems } from "@/lib/gear";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Padel Gear Guides", description: "Curated gear reviews for UK padel players. Only the picks worth buying." };
export default function GearIndex() {
  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <h1 className="font-serif text-4xl font-bold tracking-tight">Gear guides</h1>
        <p className="mt-4 max-w-lg text-pm-muted">Only the picks worth buying. We test, compare, and recommend — so you don&apos;t waste money on hype.</p>
      </section>
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
    </main>
  );
}
