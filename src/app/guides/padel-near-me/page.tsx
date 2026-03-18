import { getVenueCount, getCourtTotal, getTopCities } from '@/lib/db'
import type { Metadata } from 'next'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Find Padel Courts Near Me — UK Padel Venue Finder',
  description: 'How to find padel courts near you in the UK. Search 500+ venues with live availability, prices and direct booking links.',
}

export default async function PadelNearMePage() {
  const [venueCount, courtTotal, topCities] = await Promise.all([
    getVenueCount(),
    getCourtTotal(),
    getTopCities(10),
  ])

  return (
    <main className="pb-10">
      <article className="max-w-2xl">
        <section className="pb-8 pt-6">
          <div className="label-caps">Guide</div>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Find Padel Courts Near Me
          </h1>
          <p className="mt-4 text-lg text-pm-muted leading-relaxed">
            The UK now has {venueCount} padel venues with {courtTotal.toLocaleString()} courts. Here&apos;s how to find the nearest one and what to look for.
          </p>
        </section>

        <div className="prose-pm space-y-8 text-sm leading-[1.9] text-pm-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Use the Padel Manual court finder
            </h2>
            <p>
              The fastest way to find courts near you is the <a href="/find" className="text-pm-accent hover:underline">Padel Manual court finder</a>. It maps every padel venue in the UK — {venueCount} at last count — and shows live court availability for venues that use Playtomic booking. You can search by city, postcode, or simply browse the map.
            </p>
            <p>
              Each listing shows court count, whether courts are indoor or outdoor, booking platform, and a direct link to book. Premium venues also show player reviews, photos, and Google ratings.
            </p>
            <div className="mt-4 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-4">
              <a href="/find" className="text-xs text-pm-text font-medium hover:text-pm-accent transition-colors">
                Open the court finder →
              </a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              What to look for in a padel venue
            </h2>
            <p>
              <strong className="text-pm-text">Indoor vs outdoor.</strong> Indoor courts let you play year-round regardless of weather. Outdoor courts tend to be cheaper and often have better natural light. If you&apos;re playing in winter or live somewhere with unreliable weather, indoor is worth the premium.
            </p>
            <p>
              <strong className="text-pm-text">Booking system.</strong> Venues using Playtomic show real-time availability — you can see open slots before you arrive. Others use phone or email booking, which works fine but means less visibility on what&apos;s available.
            </p>
            <p>
              <strong className="text-pm-text">Coaching.</strong> If you&apos;re new to padel, look for venues with resident coaches or group lessons. Most UK venues now offer introductory sessions for between £10 and £25 per person.
            </p>
            <p>
              <strong className="text-pm-text">Peak vs off-peak pricing.</strong> Court hire varies significantly. Expect to pay £28–£44 per hour at peak times (evenings, weekends) and £16–£28 during off-peak slots. Some venues offer monthly memberships that bring the per-session cost down.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              Top UK cities for padel
            </h2>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {topCities.map(({ city, count }) => (
                <a
                  key={city}
                  href={`/padel/${city.toLowerCase().replace(/\s+/g, '-')}`}
                  className="rounded-xl border border-pm-border/40 px-4 py-3 hover:border-pm-accent/40 transition-all"
                >
                  <div className="font-semibold text-sm text-pm-text">{city}</div>
                  <div className="text-xs text-pm-faint">{count} venues</div>
                </a>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              London? Search by tube station
            </h2>
            <p>
              If you&apos;re in London, we&apos;ve mapped padel courts near every major tube and rail station. Search for courts <a href="/padel/near/kings-cross" className="text-pm-accent hover:underline">near King&apos;s Cross</a>, <a href="/padel/near/clapham-junction" className="text-pm-accent hover:underline">Clapham Junction</a>, <a href="/padel/near/stratford" className="text-pm-accent hover:underline">Stratford</a>, or any of 90+ stations across the capital.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-pm-text tracking-tight mb-3">
              What you&apos;ll need
            </h2>
            <p>
              Most venues provide balls, but you&apos;ll need your own racket. If you don&apos;t have one yet, many venues have loaners for beginners. Once you&apos;re hooked, our <a href="/gear/best-padel-rackets-uk" className="text-pm-accent hover:underline">racket buyer&apos;s guide</a> breaks down the options by level and budget.
            </p>
            <p>
              Wear trainers with lateral support — running shoes aren&apos;t ideal as padel involves a lot of sideways movement. Dedicated padel shoes from Asics, Head, or Adidas start at around £50. See our <a href="/guides/what-to-wear" className="text-pm-accent hover:underline">what to wear guide</a> for more.
            </p>
          </section>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="/find" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find courts near you</div>
            <p className="mt-1 text-xs text-pm-faint">{venueCount} venues across the UK</p>
          </a>
          <a href="/quiz" className="card block text-center">
            <div className="font-serif text-lg font-semibold tracking-tight">Find your racket</div>
            <p className="mt-1 text-xs text-pm-faint">30-second quiz with personalised picks</p>
          </a>
        </div>
      </article>
    </main>
  )
}
