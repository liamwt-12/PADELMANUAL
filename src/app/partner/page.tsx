import type { Metadata } from "next";
export const metadata: Metadata = { title: "Become a Founding Partner", description: "Get found by padel players who care. Limited founding slots at a locked rate." };
export default function Partner() {
  return (
    <main className="pb-10">
      <section className="pb-10 pt-6">
        <div className="label-caps">Limited founding slots</div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">Become a Founding<br />London Partner</h1>
        <p className="mt-5 max-w-2xl text-lg text-pm-muted">Padel Manual is launching in London with a small number of founding partners. We&apos;re independent &amp; curated — we feature partners, but we don&apos;t publish junk.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-pm-border/40 bg-pm-bg-card p-8">
            <div className="label-caps">What you get</div>
            <div className="mt-5 space-y-4">
              {[
                { t: "Premium profile page", d: "A dedicated listing that positions you as a curated pick — not just another name in a directory." },
                { t: "Top placement in London", d: "Featured badge, priority position in search, and highlighted on the London hub page." },
                { t: "Two features in The Weekly Note", d: "Spotlight in our plain-text newsletter to an engaged audience of London padel players." },
                { t: "Locked founding rate for 12 months", d: "The rate won't increase for you, even when we raise prices for new partners." },
              ].map((item) => <div key={item.t}><div className="text-sm font-semibold text-pm-text">{item.t}</div><div className="mt-1 text-[13px] leading-relaxed text-pm-muted">{item.d}</div></div>)}
            </div>
          </div>
          <div className="rounded-3xl border border-pm-border/40 bg-pm-bg-card p-8">
            <div className="label-caps">Founding rate</div>
            <div className="mt-4 font-serif text-4xl font-bold tracking-tight">£399<span className="text-lg font-normal text-pm-faint"> / year</span></div>
            <div className="mt-2 text-sm text-pm-faint line-through">Future rate £699/year</div>
            <div className="mt-6 rounded-xl bg-pm-accent/5 border border-pm-accent/20 p-4">
              <div className="text-sm font-medium text-pm-text">That&apos;s £33/month for a year of premium visibility.</div>
              <div className="mt-1 text-[13px] text-pm-muted">Less than what most coaches spend on a single Instagram boost.</div>
            </div>
            <form action="/api/stripe/checkout" method="POST" className="mt-6">
              <button type="submit" className="btn-primary w-full text-center">Apply &amp; pay £399</button>
            </form>
            <div className="mt-4 text-xs text-pm-faint">After payment you&apos;ll receive an intake form. We publish your profile within 48 hours.</div>
          </div>
        </div>
      </section>
    </main>
  );
}
