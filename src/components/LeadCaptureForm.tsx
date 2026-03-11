'use client'

import { useState } from 'react'

interface Props {
  listingId: string
  venueName: string
}

export default function LeadCaptureForm({ listingId, venueName }: Props) {
  const [form, setForm] = useState({ name: '', email: '', interest: 'general', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    try {
      const res = await fetch('/api/listing-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          player_name: form.name,
          player_email: form.email,
          interest_type: form.interest,
          player_message: form.message || null,
        }),
      })

      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError(true)
    }

    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-base font-semibold tracking-tight text-emerald-800">Message sent</h3>
        <p className="mt-1 text-sm text-emerald-700">
          {venueName} will be in touch soon.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-pm-border/30 bg-pm-bg-card p-6">
      <h3 className="font-serif text-lg font-semibold tracking-tight mb-1">Get in touch</h3>
      <p className="text-xs text-pm-faint mb-4">Send a message to {venueName}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Your name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
              placeholder="you@email.com"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-pm-muted block mb-1">I&apos;m interested in</label>
          <select
            value={form.interest}
            onChange={e => setForm({ ...form, interest: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
          >
            <option value="general">General enquiry</option>
            <option value="booking">Booking a court</option>
            <option value="coaching">Coaching / lessons</option>
            <option value="membership">Membership</option>
            <option value="events">Events / leagues</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-pm-muted block mb-1">Message (optional)</label>
          <textarea
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent resize-none"
            placeholder="Any details..."
          />
        </div>

        {error && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary text-sm w-full text-center disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </div>
  )
}
