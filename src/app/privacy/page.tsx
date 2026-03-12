import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Padel Manual collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <main className="py-12 pb-20">
      <div className="max-w-2xl mx-auto">
        <p className="label-caps mb-3">Legal</p>
        <h1 className="font-serif text-4xl tracking-tight text-pm-text">Privacy Policy</h1>
        <p className="mt-3 text-sm text-pm-faint">Effective 12 March 2026</p>

        <div className="mt-10 space-y-10 text-sm text-pm-muted leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">What we collect</h2>
            <p>We collect only what we need to run Padel Manual. Here&apos;s the full list:</p>
            <ul className="mt-3 space-y-2 list-disc list-outside pl-5">
              <li><strong className="text-pm-text">Venue owner accounts</strong> — your email address and name when you claim a listing or sign up.</li>
              <li><strong className="text-pm-text">Listing data</strong> — venue details you provide: name, address, courts, photos, booking links, and descriptions.</li>
              <li><strong className="text-pm-text">Payment information</strong> — processed entirely by Stripe. We never see or store your card details.</li>
              <li><strong className="text-pm-text">Google OAuth tokens</strong> — if you connect your Google Business Profile, we store an access token and refresh token to fetch your search data. We only request the minimum permissions needed.</li>
              <li><strong className="text-pm-text">Player lead data</strong> — when a player submits an enquiry through a venue listing, we collect their name, email, and message to pass on to the venue owner.</li>
              <li><strong className="text-pm-text">Analytics</strong> — listing view counts and booking click counts. No personal tracking, no fingerprinting.</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">How we use it</h2>
            <ul className="space-y-2 list-disc list-outside pl-5">
              <li>To operate the platform — showing listings, processing claims, managing subscriptions.</li>
              <li>To send venue owners their weekly stats email (Monday mornings).</li>
              <li>To process payments through Stripe for Premium subscriptions.</li>
              <li>To connect your Google Business Profile and display your search insights.</li>
              <li>To forward player leads to the relevant venue owner.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">What we don&apos;t do</h2>
            <p>This matters more than what we do:</p>
            <ul className="mt-3 space-y-2 list-disc list-outside pl-5">
              <li>We <strong className="text-pm-text">never sell your data</strong>. Not to advertisers, not to data brokers, not to anyone.</li>
              <li>We <strong className="text-pm-text">never share your data with third parties</strong> except the services we need to operate: Stripe (payments), Resend (emails), Google (Business Profile API), and Supabase (database hosting).</li>
              <li>We don&apos;t run targeted ads. We don&apos;t build advertising profiles. We don&apos;t track you across the web.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">Cookies</h2>
            <p>
              We use one cookie: a Supabase authentication session cookie. It keeps you logged in.
              That&apos;s it. No analytics cookies, no marketing cookies, no cookie banner needed.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">Your rights</h2>
            <p>You can:</p>
            <ul className="mt-3 space-y-2 list-disc list-outside pl-5">
              <li><strong className="text-pm-text">Access</strong> — ask us for a copy of all data we hold about you.</li>
              <li><strong className="text-pm-text">Delete</strong> — ask us to delete your account and all associated data.</li>
              <li><strong className="text-pm-text">Portability</strong> — ask us to export your data in a standard format.</li>
              <li><strong className="text-pm-text">Correction</strong> — ask us to fix any inaccurate data.</li>
            </ul>
            <p className="mt-3">
              Email <a href="mailto:hello@padelmanual.com" className="text-pm-accent hover:underline">hello@padelmanual.com</a> for
              any of the above. We&apos;ll respond within 30 days.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">Contact</h2>
            <p>
              Padel Manual is operated by Useful for Humans. For any questions about this policy or your data, email{' '}
              <a href="mailto:hello@padelmanual.com" className="text-pm-accent hover:underline">hello@padelmanual.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
