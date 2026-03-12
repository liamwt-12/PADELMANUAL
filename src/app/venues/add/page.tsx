import type { Metadata } from 'next'
import VenueSubmitForm from './VenueSubmitForm'

export const metadata: Metadata = {
  title: 'Add Your Venue',
  description: 'Add your padel venue to Padel Manual. We\'ll review and list it within 48 hours.',
}

export default function AddVenuePage() {
  return (
    <main className="py-12 pb-20">
      <div className="max-w-xl mx-auto">
        <p className="label-caps mb-3">Add a venue</p>
        <h1 className="font-serif text-4xl tracking-tight text-pm-text">
          Add your venue to Padel Manual
        </h1>
        <p className="mt-4 text-sm text-pm-muted leading-relaxed">
          Can&apos;t find your venue in our directory? Tell us about it and we&apos;ll
          add it within 48 hours. Once it&apos;s live, you can claim it and access your dashboard.
        </p>

        <div className="mt-8">
          <VenueSubmitForm />
        </div>
      </div>
    </main>
  )
}
