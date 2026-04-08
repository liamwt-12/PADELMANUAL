import type { Metadata } from 'next';
import PlayTodayBanner from '@/components/PlayTodayBanner';

export const metadata: Metadata = {
  title: 'What to Wear to Padel — Clothing Guide (2026)',
  description: 'What to wear playing padel. Shoes, clothing, and accessories for indoor and outdoor courts. UK buyer\'s guide.',
};

export default function WhatToWearPage() {
  return (
    <main className="pb-10">
      <article className="max-w-2xl">
        <section className="pb-8 pt-6">
          <div className="label-caps">Guide</div>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">What to wear to padel</h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            The practical guide to padel clothing. What you need, what you don&apos;t, and what makes an actual difference on court.
          </p>
        </section>

        <div className="space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">The short version</h2>
            <p>Wear what you&apos;d wear to a gym session or a tennis match. Shorts or a skirt, a breathable top, and — this is the important bit — proper padel or tennis shoes. The shoes matter more than anything else.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Shoes — the one thing worth spending on</h2>
            <p>Padel courts have artificial grass surfaces. Running shoes grip too much and can cause ankle injuries. Tennis shoes or dedicated padel shoes have herringbone or omni soles that grip appropriately without catching.</p>
            <p className="mt-3">Budget £50-90 for a decent pair. They&apos;ll last 6-12 months of regular play. This is genuinely the most important piece of padel equipment after your racket.</p>
            <div className="mt-4 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-4">
              <a href="/gear/shoes/all" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Browse 220+ padel shoes →</a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Clothing</h2>
            <p>Any breathable sportswear works. Most players wear shorts and a t-shirt or polo. For women, a sports skirt or shorts with a tank top is standard. The key qualities to look for are moisture-wicking fabric and freedom of movement — padel involves a lot of lateral steps and overhead shots.</p>
            <p className="mt-3">Avoid anything with zips or buttons that could catch on the racket. Cotton absorbs sweat and gets heavy, so synthetic fabrics are better for longer sessions.</p>
            <div className="mt-4 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-4">
              <a href="/gear/shop" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">Browse padel clothing →</a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Indoor vs outdoor</h2>
            <p>For indoor courts, standard padel clothing works year-round. For outdoor courts in the UK, layer up in cooler months — a lightweight quarter-zip or long-sleeve base layer under a t-shirt works well. You warm up quickly once you start playing, so easy-to-remove layers are ideal.</p>
            <p className="mt-3">In summer, a cap or visor helps with sun glare, especially on courts without shade.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">Accessories worth having</h2>
            <p><strong className="text-pm-text">Overgrip:</strong> A fresh overgrip on your racket handle improves comfort and control. They cost £2-3 each and should be replaced every few sessions.</p>
            <p className="mt-2"><strong className="text-pm-text">Wristband:</strong> Sounds old-school but genuinely useful for keeping sweat off your grip hand.</p>
            <p className="mt-2"><strong className="text-pm-text">Sports socks:</strong> Padel-specific or tennis socks with extra cushioning at the heel and toe make a noticeable difference in comfort.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">For your first game</h2>
            <p>Don&apos;t overthink it. If you have tennis or gym shoes with non-marking soles, those will do for your first session. Most venues have dress codes similar to tennis clubs — clean sportswear, no jeans, no black-soled shoes that mark the court.</p>
            <p className="mt-3">If you enjoy it (you will), invest in proper padel shoes before your second or third session. Everything else can wait.</p>
          </section>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <a href="/gear/shoes/all" className="card block text-center">
            <div className="font-serif text-base font-semibold tracking-tight">Padel shoes</div>
            <p className="mt-1 text-xs text-pm-faint">220+ reviewed</p>
          </a>
          <a href="/gear/shop" className="card block text-center">
            <div className="font-serif text-base font-semibold tracking-tight">Clothing</div>
            <p className="mt-1 text-xs text-pm-faint">Browse all gear</p>
          </a>
          <a href="/quiz" className="card block text-center">
            <div className="font-serif text-base font-semibold tracking-tight">Racket quiz</div>
            <p className="mt-1 text-xs text-pm-faint">Find your racket</p>
          </a>
        </div>

        <div className="mt-12">
          <PlayTodayBanner />
        </div>
      </article>
    </main>
  );
}
