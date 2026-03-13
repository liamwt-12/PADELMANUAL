'use client'

import { useState } from 'react'

type Plan = 'monthly' | 'annual'

const features = [
  'Player leads direct to your inbox',
  'Listing analytics (views, clicks, trends)',
  'Google Business Profile insights',
  'Court utilisation data',
  'CSV lead export',
  'Listing completion score',
  'Priority placement in city pages',
  'Verified venue badge',
]

export default function PricingSection() {
  const [activePlan, setActivePlan] = useState<Plan>('annual')
  const [loading, setLoading] = useState<Plan | null>(null)

  function handleGetStarted(plan: Plan) {
    setLoading(plan)
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/stripe/checkout'
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'plan'
    input.value = plan
    form.appendChild(input)
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <div>
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-pm-faint mb-6">
        Padel Manual Business
      </p>

      {/* Toggle pills */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-full border border-pm-border p-1 gap-1">
          <button
            onClick={() => setActivePlan('monthly')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              activePlan === 'monthly'
                ? 'bg-[#c4956a] text-white'
                : 'text-pm-muted hover:text-pm-text'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActivePlan('annual')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              activePlan === 'annual'
                ? 'bg-[#c4956a] text-white'
                : 'text-pm-muted hover:text-pm-text'
            }`}
          >
            Annual &mdash; save 29%
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {/* Monthly */}
        <div
          className={`rounded-2xl border p-6 transition-all ${
            activePlan === 'monthly'
              ? 'border-[#c4956a]/40 bg-[#c4956a]/[0.03]'
              : 'border-pm-border'
          }`}
        >
          <p className="text-sm font-medium text-pm-text">Monthly</p>
          <p className="font-serif text-4xl tracking-tight text-pm-text mt-3">
            &pound;29
          </p>
          <p className="text-sm text-pm-muted mt-1">per month</p>
          <button
            onClick={() => handleGetStarted('monthly')}
            disabled={loading !== null}
            className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all disabled:opacity-50 ${
              activePlan === 'monthly'
                ? 'bg-[#c4956a] text-white hover:opacity-90'
                : 'border border-pm-border text-pm-text hover:border-[#c4956a]'
            }`}
          >
            {loading === 'monthly' ? 'Redirecting...' : 'Get started'}
          </button>
        </div>

        {/* Annual */}
        <div
          className={`rounded-2xl border p-6 transition-all ${
            activePlan === 'annual'
              ? 'border-[#c4956a]/40 bg-[#c4956a]/[0.03]'
              : 'border-pm-border'
          }`}
        >
          <p className="text-sm font-medium text-pm-text">Annual</p>
          <p className="font-serif text-4xl tracking-tight text-pm-text mt-3">
            &pound;249
          </p>
          <p className="text-sm text-pm-muted mt-1">per year</p>
          <p className="text-xs text-pm-muted mt-1">Equivalent to &pound;20.75/mo</p>
          <p className="text-xs font-medium text-[#c4956a] mt-2">
            Save &pound;99 &mdash; two months free
          </p>
          <button
            onClick={() => handleGetStarted('annual')}
            disabled={loading !== null}
            className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all disabled:opacity-50 ${
              activePlan === 'annual'
                ? 'bg-[#c4956a] text-white hover:opacity-90'
                : 'border border-pm-border text-pm-text hover:border-[#c4956a]'
            }`}
          >
            {loading === 'annual' ? 'Redirecting...' : 'Get started'}
          </button>
        </div>
      </div>

      {/* Feature list */}
      <ul className="space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-pm-text">
            <span className="text-[#c4956a] text-xs mt-0.5 shrink-0">&#10003;</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
