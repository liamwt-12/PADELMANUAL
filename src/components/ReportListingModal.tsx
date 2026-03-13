'use client'

import { useState } from 'react'

const REPORT_TYPES = [
  { value: 'permanently_closed', label: 'This venue has permanently closed' },
  { value: 'incorrect_info', label: 'The information on this page is incorrect' },
  { value: 'duplicate', label: 'This is a duplicate listing' },
  { value: 'other', label: 'Other' },
]

export default function ReportListingModal({
  listingId,
  venueName,
}: {
  listingId: string
  venueName: string
}) {
  const [open, setOpen] = useState(false)
  const [reportType, setReportType] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reportType) return
    setSubmitting(true)

    try {
      await fetch('/api/listing/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          report_type: reportType,
          reporter_email: email || null,
          notes: notes || null,
        }),
      })
      setSubmitted(true)
    } catch {
      // Silent fail — still show thank you
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-pm-faint hover:text-pm-muted transition-colors"
      >
        Something wrong with this listing? Report an issue
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => !submitting && setOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-pm-border bg-[#faf9f6] p-6 shadow-lg">
        {submitted ? (
          <div className="text-center py-4">
            <p className="font-serif text-lg tracking-tight text-pm-text">Thank you</p>
            <p className="text-sm text-pm-muted mt-2">
              We&apos;ll review your report about {venueName}.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-5 text-xs text-pm-accent hover:underline"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-lg tracking-tight text-pm-text">Report an issue</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-pm-faint hover:text-pm-text transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset className="space-y-2">
                {REPORT_TYPES.map(rt => (
                  <label
                    key={rt.value}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                      reportType === rt.value
                        ? 'border-[#c4956a]/40 bg-[#c4956a]/[0.04]'
                        : 'border-pm-border hover:border-pm-border/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_type"
                      value={rt.value}
                      checked={reportType === rt.value}
                      onChange={e => setReportType(e.target.value)}
                      className="accent-[#c4956a]"
                    />
                    <span className="text-sm text-pm-text">{rt.label}</span>
                  </label>
                ))}
              </fieldset>

              {(reportType === 'incorrect_info' || reportType === 'other') && (
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Tell us more (optional)"
                  rows={3}
                  className="w-full rounded-xl border border-pm-border bg-white px-4 py-3 text-sm text-pm-text placeholder:text-pm-faint focus:outline-none focus:border-[#c4956a]/40"
                />
              )}

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email (optional, for follow-up)"
                className="w-full rounded-xl border border-pm-border bg-white px-4 py-3 text-sm text-pm-text placeholder:text-pm-faint focus:outline-none focus:border-[#c4956a]/40"
              />

              <button
                type="submit"
                disabled={!reportType || submitting}
                className="w-full rounded-full bg-[#c4956a] text-white px-6 py-3 text-sm font-semibold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit report'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
