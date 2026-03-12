'use client'

import { useState } from 'react'

export default function VenueSubmitForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    venue_name: '',
    city: '',
    postcode: '',
    contact_name: '',
    contact_email: '',
    role: 'owner',
    website_url: '',
    courts: '',
    indoor: '',
    referral_source: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/venues/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          courts: form.courts ? parseInt(form.courts) : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-8 text-center">
        <h3 className="font-serif text-xl tracking-tight text-emerald-800">Venue submitted</h3>
        <p className="mt-3 text-sm text-emerald-700 leading-relaxed max-w-sm mx-auto">
          Thanks — we&apos;ll review your submission and add your venue within 48 hours.
          Check your email for a confirmation.
        </p>
        <p className="mt-4 text-xs text-pm-faint">
          Already have a listed venue?{' '}
          <a href="/claim" className="text-pm-accent hover:underline font-medium">Claim it here →</a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Venue details */}
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pm-text/40 mb-2">Venue details</p>

        <div>
          <label className="text-[11px] font-medium text-pm-muted block mb-1">Venue name *</label>
          <input
            type="text"
            required
            value={form.venue_name}
            onChange={e => update('venue_name', e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
            placeholder="e.g. The Padel Club"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">City *</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={e => update('city', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
              placeholder="e.g. London"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Postcode *</label>
            <input
              type="text"
              required
              value={form.postcode}
              onChange={e => update('postcode', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
              placeholder="e.g. SW1A 1AA"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Number of courts</label>
            <input
              type="number"
              min="1"
              value={form.courts}
              onChange={e => update('courts', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
              placeholder="e.g. 4"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Indoor / Outdoor</label>
            <select
              value={form.indoor}
              onChange={e => update('indoor', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
            >
              <option value="">Select...</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-pm-muted block mb-1">Website URL</label>
          <input
            type="url"
            value={form.website_url}
            onChange={e => update('website_url', e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Your details */}
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pm-text/40 mb-2">Your details</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Your name *</label>
            <input
              type="text"
              required
              value={form.contact_name}
              onChange={e => update('contact_name', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Your email *</label>
            <input
              type="email"
              required
              value={form.contact_email}
              onChange={e => update('contact_email', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
              placeholder="you@venue.com"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-pm-muted block mb-1">Your role</label>
          <select
            value={form.role}
            onChange={e => update('role', e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
          >
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="coach">Coach</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-pm-muted block mb-1">How did you hear about Padel Manual?</label>
          <input
            type="text"
            value={form.referral_source}
            onChange={e => update('referral_source', e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
            placeholder="Optional"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 px-1">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full text-sm disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit venue'}
      </button>

      <p className="text-[11px] text-pm-faint text-center">
        We&apos;ll review your submission and add the venue within 48 hours.
      </p>
    </form>
  )
}
