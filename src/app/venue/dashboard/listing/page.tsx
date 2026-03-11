'use client'

import { useState, useEffect } from 'react'
import { useDashboard } from '@/lib/hooks/useVenueOwner'
import UpgradeButton from '@/components/UpgradeButton'

type FieldDef = {
  key: string
  label: string
  type: 'text' | 'url' | 'tel' | 'email' | 'textarea'
  placeholder: string
  free: boolean
}

const FIELDS: FieldDef[] = [
  { key: 'website_url', label: 'Website', type: 'url', placeholder: 'https://yourvenue.com', free: true },
  { key: 'booking_url', label: 'Booking URL', type: 'url', placeholder: 'https://playtomic.io/...', free: true },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '020 1234 5678', free: true },
  { key: 'short_blurb', label: 'Short blurb', type: 'text', placeholder: 'One-line description shown on search results', free: false },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Full description of your venue, facilities, coaching...', free: false },
  { key: 'instagram_url', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/yourvenue', free: false },
  { key: 'email', label: 'Contact email', type: 'email', placeholder: 'hello@yourvenue.com', free: false },
  { key: 'youtube_video_url', label: 'YouTube video', type: 'url', placeholder: 'https://youtube.com/watch?v=...', free: false },
  { key: 'announcement', label: 'Announcement banner', type: 'text', placeholder: 'Pin a message to the top of your listing', free: false },
]

export default function ListingPage() {
  const { listing, isPremium, isTrial, refresh } = useDashboard()
  const canEdit = true // all claimed users can edit (free fields gated per-field)
  const hasPremium = isPremium || isTrial

  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form from listing data
  useEffect(() => {
    if (!listing) return
    const initial: Record<string, string> = {}
    for (const f of FIELDS) {
      const val = (listing as Record<string, unknown>)[f.key]
      initial[f.key] = typeof val === 'string' ? val : ''
    }
    setForm(initial)
  }, [listing])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    const res = await fetch('/api/listing/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to save')
    } else {
      setSaved(true)
      refresh()
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  const filledCount = FIELDS.filter(f => {
    const val = form[f.key]
    return val && val.trim().length > 0
  }).length
  const completionPct = Math.round((filledCount / FIELDS.length) * 100)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="label-caps">Your Listing</p>
        <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight">
          {listing?.name || 'Your Venue'}
        </h1>
        {listing && (
          <a href={`/${listing.slug}`} className="text-xs text-pm-accent hover:underline mt-1 inline-block">
            View live listing →
          </a>
        )}
      </div>

      {/* Completion bar */}
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-pm-text">Listing completeness</p>
          <p className="text-sm font-serif font-bold text-pm-accent">{completionPct}%</p>
        </div>
        <div className="h-1.5 bg-pm-bg-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-pm-accent rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-pm-faint">
          {filledCount} of {FIELDS.length} fields completed
        </p>
      </div>

      {/* Editor fields */}
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card divide-y divide-pm-border/40 mb-4">
        {FIELDS.map(field => {
          const locked = !field.free && !hasPremium
          return (
            <div key={field.key} className="px-5 py-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-pm-text">{field.label}</label>
                {locked && (
                  <span className="text-[10px] text-pm-accent font-medium">Premium</span>
                )}
              </div>

              {locked ? (
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={form[field.key] || ''}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 text-sm border border-pm-border/40 rounded-xl bg-pm-bg-hover text-pm-faint cursor-not-allowed"
                  />
                </div>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={form[field.key] || ''}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent resize-none"
                />
              ) : (
                <input
                  type={field.type}
                  value={form[field.key] || ''}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Premium upsell for free users */}
      {!hasPremium && (
        <div className="rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-pm-text">Unlock all fields</p>
            <p className="text-xs text-pm-muted mt-0.5">
              Upgrade to edit description, Instagram, video, announcement banner, and more.
            </p>
          </div>
          <UpgradeButton className="shrink-0" />
        </div>
      )}

      {/* Save bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>

        {saved && (
          <span className="text-sm text-emerald-600 font-medium">Saved</span>
        )}
        {error && (
          <span className="text-sm text-red-600">{error}</span>
        )}
      </div>
    </div>
  )
}
