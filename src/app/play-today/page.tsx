import type { Metadata } from 'next'
import UnavailableNotice from './UnavailableNotice'

export const metadata: Metadata = {
  title: 'Play Today — Live Court Availability (Paused)',
  description:
    'Live padel court availability is currently unavailable on Padel Manual. Browse UK venues and book directly with each club.',
}

export default function PlayTodayPage() {
  return (
    <main className="pb-10">
      <section className="pt-6 pb-8">
        <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">Play Today</h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-pm-muted">
          Live court availability is paused.
        </p>
      </section>

      <UnavailableNotice />
    </main>
  )
}
