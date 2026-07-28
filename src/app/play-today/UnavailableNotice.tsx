/**
 * Honest replacement for the live-availability search.
 *
 * Playtomic blocks our availability requests, so we cannot say which courts are
 * free. Saying "no courts available" would be a confident wrong answer, so we
 * say what is actually true and point people at something that still works.
 */
export default function UnavailableNotice({ cityName }: { cityName?: string }) {
  const where = cityName ? ` in ${cityName}` : ''

  return (
    <section className="mb-10 rounded-2xl border border-pm-border bg-pm-bg-card p-6">
      <p className="label-caps mb-3">Live availability is currently unavailable</p>
      <p className="text-sm leading-relaxed text-pm-muted">
        Padel Manual can no longer read live court availability from Playtomic, so we
        cannot tell you which courts{where} are free right now. We would rather say that
        than show you an empty list and let you assume everything is booked.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-pm-muted">
        Every venue below still links straight to its own booking page, which shows the
        real, current availability.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href="/find"
          className="rounded-full bg-pm-text text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Browse all UK venues →
        </a>
      </div>
    </section>
  )
}
