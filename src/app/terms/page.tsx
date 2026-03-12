import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for using Padel Manual.',
}

export default function TermsPage() {
  return (
    <main className="py-12 pb-20">
      <div className="max-w-2xl mx-auto">
        <p className="label-caps mb-3">Legal</p>
        <h1 className="font-serif text-4xl tracking-tight text-pm-text">Terms of Service</h1>
        <p className="mt-3 text-sm text-pm-faint">Effective 12 March 2026</p>

        <div className="mt-10 space-y-10 text-sm text-pm-muted leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">The service</h2>
            <p>
              Padel Manual is a UK padel venue directory with a premium dashboard for venue owners.
              It is operated by Useful for Humans.
            </p>
            <p className="mt-3">
              The free listing gives your venue visibility in our directory. The Premium dashboard
              (Padel Manual Business) adds analytics, player leads, Google Business Profile insights,
              court utilisation data, and a weekly stats email.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">Premium subscription</h2>
            <ul className="space-y-2 list-disc list-outside pl-5">
              <li>Padel Manual Business costs <strong className="text-pm-text">&pound;29 per month</strong>.</li>
              <li>You can cancel at any time. Cancellation takes effect at the end of your current billing period.</li>
              <li>We don&apos;t offer refunds on partial months. If you cancel mid-month, you keep access until the end of that billing cycle.</li>
              <li>Payments are processed securely by Stripe. We never see your card details.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">Venue owner responsibilities</h2>
            <ul className="space-y-2 list-disc list-outside pl-5">
              <li>Listing information must be accurate. If your venue moves, changes hours, or closes, update your listing.</li>
              <li>You own your content. Anything you add to your listing — descriptions, photos, announcements — remains yours.</li>
              <li>You&apos;re responsible for responding to player leads in a reasonable timeframe.</li>
              <li>By claiming a listing, you confirm you have authority to represent that venue (owner, manager, or authorised staff).</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">Our responsibilities</h2>
            <ul className="space-y-2 list-disc list-outside pl-5">
              <li>We&apos;ll make reasonable efforts to keep the platform available and reliable.</li>
              <li>We take data security seriously and follow standard practices to protect your information.</li>
              <li>We don&apos;t guarantee a specific number of listing views, clicks, or leads. These depend on player interest in your area.</li>
              <li>If we experience downtime or data issues, we&apos;ll communicate promptly and honestly.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">Prohibited</h2>
            <ul className="space-y-2 list-disc list-outside pl-5">
              <li>Creating fake venue listings or claiming venues you don&apos;t represent.</li>
              <li>Using the platform to send spam or unsolicited marketing to players.</li>
              <li>Scraping, crawling, or automated data extraction from Padel Manual.</li>
              <li>Attempting to access other venue owners&apos; data or dashboards.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">Termination</h2>
            <p>
              We reserve the right to remove listings or suspend accounts that violate these terms.
              If we need to take action, we&apos;ll tell you why and give you a chance to resolve the
              issue first, unless it&apos;s something serious like fraud or spam.
            </p>
            <p className="mt-3">
              You can delete your account at any time by emailing{' '}
              <a href="mailto:hello@padelmanual.com" className="text-pm-accent hover:underline">hello@padelmanual.com</a>.
              We&apos;ll remove your data within 30 days.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-serif text-xl tracking-tight text-pm-text mb-3">Contact</h2>
            <p>
              Questions about these terms? Email{' '}
              <a href="mailto:hello@padelmanual.com" className="text-pm-accent hover:underline">hello@padelmanual.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
