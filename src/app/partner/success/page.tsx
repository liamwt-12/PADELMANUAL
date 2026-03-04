export default function Success() {
  return (
    <main className="pb-10">
      <section className="pb-10 pt-6">
        <h1 className="font-serif text-4xl font-bold tracking-tight">You&apos;re in.</h1>
        <p className="mt-4 max-w-lg text-lg text-pm-muted">Next step: complete the intake form and we&apos;ll publish your profile within 48 hours.</p>
        <div className="mt-8 max-w-lg rounded-3xl border border-pm-border/40 bg-pm-bg-card p-8">
          <div className="label-caps">Complete your profile</div>
          <p className="mt-3 text-sm text-pm-muted">Tell us about your coaching, venue, or league — and we&apos;ll write your listing in the Padel Manual voice.</p>
          <a className="btn-primary mt-6 inline-block" href="https://tally.so" target="_blank" rel="noreferrer">Complete intake form</a>
        </div>
      </section>
    </main>
  );
}
