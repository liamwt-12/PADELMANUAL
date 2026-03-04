import { NewsletterForm } from "@/components/NewsletterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Weekly Note",
  description: "A private weekly email for UK padel players. One gear pick. One spotlight. One event worth your time.",
};

export default function Weekly() {
  return (
    <main className="pb-10">
      <section className="pt-8 pb-10">
        <span className="font-body text-[10px] font-semibold tracking-[0.14em] uppercase text-brand-accent">
          The Weekly Note
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-brand-black mt-3">
          One gear pick. One spotlight.
          <br />
          One event worth your time.
        </h1>
        <p className="font-body text-lg text-brand-muted mt-4 max-w-2xl">
          A private weekly email for UK padel players. Plain text. No banners.
          No noise. Just the one thing worth knowing this week.
        </p>
        <div className="mt-10 rounded-3xl border border-brand-ash/60 bg-[#fafaf9] p-8 max-w-lg">
          <div className="font-body text-[10px] font-semibold tracking-[0.14em] uppercase text-brand-pewter">
            Join free
          </div>
          <p className="font-body text-sm text-brand-muted mt-3">
            Lands every Sunday morning. Unsubscribe anytime.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
        <div className="mt-12 max-w-lg">
          <h2 className="font-display text-xl font-semibold text-brand-black tracking-tight">
            What to expect
          </h2>
          <div className="mt-5 space-y-4">
            {[
              { title: "One gear pick", desc: "A specific racket, shoe, or piece of kit — tested and recommended." },
              { title: "One local spotlight", desc: "A coach, court, or league in London worth your attention this week." },
              { title: "One event", desc: "A tournament, social session, or drop-in worth showing up to." },
            ].map((item) => (
              <div key={item.title}>
                <div className="font-body text-sm font-semibold text-brand-black">{item.title}</div>
                <div className="font-body text-[13px] text-brand-muted mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
