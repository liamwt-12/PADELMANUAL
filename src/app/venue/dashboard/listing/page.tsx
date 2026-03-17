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
  helper?: string
  weight: number
}

const FIELDS: FieldDef[] = [
  { key: 'website_url', label: 'Website', type: 'url', placeholder: 'https://yourvenue.com', free: true, weight: 10 },
  { key: 'booking_url', label: 'Booking URL', type: 'url', placeholder: 'https://playtomic.io/...', free: true, weight: 15 },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '020 1234 5678', free: true, weight: 10 },
  { key: 'short_blurb', label: 'Short blurb', type: 'text', placeholder: 'One-line description shown on search results', free: false, weight: 0 },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Full description of your venue, facilities, coaching...', free: false, weight: 20 },
  { key: 'instagram_url', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/yourvenue', free: false, weight: 10 },
  { key: 'email', label: 'Contact email', type: 'email', placeholder: 'hello@yourvenue.com', free: false, weight: 0 },
  { key: 'youtube_video_url', label: 'YouTube video', type: 'url', placeholder: 'https://youtube.com/watch?v=...', free: false, weight: 10, helper: 'Paste a YouTube video URL to embed it on your listing' },
  { key: 'announcement', label: 'Announcement banner', type: 'text', placeholder: 'Pin a message to the top of your listing', free: false, weight: 10, helper: 'This appears as a banner on your listing page. Keep it brief.' },
  { key: 'whatsapp_number', label: 'WhatsApp Business number', type: 'tel', placeholder: '447911123456', free: true, weight: 0, helper: 'Include country code, e.g. 447911123456. Players can message you directly from your listing.' },
  { key: 'google_place_id', label: 'Google Place ID', type: 'text', placeholder: 'ChIJ...', free: true, weight: 0, helper: 'Paste your Google Place ID to show your Google rating on the dashboard. Find it at developers.google.com/maps/documentation/places/web-service/place-id-finder' },
]

// Photos weight: 15 (checked separately via listing.images)

function getCompletionScore(form: Record<string, string>, hasPhotos: boolean): number {
  let score = 0
  for (const f of FIELDS) {
    if (f.weight > 0 && form[f.key]?.trim()) {
      score += f.weight
    }
  }
  if (hasPhotos) score += 15
  return Math.min(score, 100)
}

function getMissingFields(form: Record<string, string>, hasPhotos: boolean): { label: string; key: string }[] {
  const missing: { label: string; key: string }[] = []
  for (const f of FIELDS) {
    if (f.weight > 0 && !form[f.key]?.trim()) {
      missing.push({ label: f.label, key: f.key })
    }
  }
  if (!hasPhotos) {
    missing.push({ label: 'Photos', key: 'photos' })
  }
  return missing
}

export default function ListingPage() {
  const { listing, isPremium, isTrial, refresh } = useDashboard()
  const hasPremium = isPremium || isTrial

  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  useEffect(() => {
    document.title = 'Your Listing — Padel Manual Dashboard'
  }, [])

  useEffect(() => {
    if (!listing) return
    const initial: Record<string, string> = {}
    for (const f of FIELDS) {
      const val = (listing as Record<string, unknown>)[f.key]
      initial[f.key] = typeof val === 'string' ? val : ''
    }
    setForm(initial)
    setPhotos(listing.images || [])
  }, [listing])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    const res = await fetch('/api/listing/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, images: photos, listing_id: listing?.id }),
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

  const hasPhotos = photos.length > 0
  const score = getCompletionScore(form, hasPhotos)
  const missing = getMissingFields(form, hasPhotos)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl tracking-tight text-pm-text">
          {listing?.name || 'Your Venue'}
        </h1>
        {listing && (
          <a
            href={`/${listing.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-pm-accent hover:underline mt-2 inline-block"
          >
            Preview your listing →
          </a>
        )}
      </div>

      {/* Completion score */}
      <div className="mb-10">
        <div className="border-t border-pm-border" />
        <div className="mt-8">
          {score >= 100 ? (
            <div className="flex items-center gap-2">
              <span className="text-pm-accent">&#10003;</span>
              <p className="font-serif text-xl tracking-tight text-pm-text">Your listing is complete.</p>
            </div>
          ) : (
            <p className="font-serif text-xl tracking-tight text-pm-text">
              Your listing is {score}% complete
            </p>
          )}
          <div className="mt-4 h-1 bg-pm-bg-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-pm-accent rounded-full transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
          {missing.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {missing.map(m => (
                <p key={m.key} className="text-xs text-pm-faint">
                  <span className="text-pm-muted">{m.label}</span>
                  {m.key !== 'photos' && (
                    <button
                      onClick={() => {
                        const el = document.getElementById(`field-${m.key}`)
                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        el?.focus()
                      }}
                      className="ml-1 text-pm-accent hover:underline"
                    >
                      Add →
                    </button>
                  )}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor fields */}
      <div className="space-y-6 mb-6">
        {FIELDS.map(field => {
          const locked = !field.free && !hasPremium
          return (
            <div key={field.key} id={`field-${field.key}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="label-caps text-pm-faint">{field.label}</label>
                {locked && (
                  <span className="text-[10px] text-pm-accent font-medium">Premium</span>
                )}
              </div>

              {locked ? (
                <input
                  type="text"
                  disabled
                  value={form[field.key] || ''}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 text-sm border border-pm-border/40 rounded-xl bg-pm-bg-hover text-pm-faint cursor-not-allowed"
                />
              ) : field.type === 'textarea' ? (
                <textarea
                  value={form[field.key] || ''}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent resize-none"
                />
              ) : (
                <input
                  type={field.type}
                  value={form[field.key] || ''}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
                />
              )}
              {field.helper && !locked && (
                <p className="mt-1.5 text-[11px] text-pm-faint">{field.helper}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Photos */}
      <div className="mb-6">
        <p className="label-caps text-pm-faint mb-3">Photos</p>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
            {photos.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-pm-bg-hover">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  title="Remove photo"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="url"
            value={newPhotoUrl}
            onChange={e => setNewPhotoUrl(e.target.value)}
            placeholder="Paste a photo URL..."
            className="flex-1 px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
          />
          <button
            onClick={() => {
              if (newPhotoUrl.trim()) {
                setPhotos([...photos, newPhotoUrl.trim()])
                setNewPhotoUrl('')
              }
            }}
            disabled={!newPhotoUrl.trim()}
            className="shrink-0 rounded-xl border border-pm-border px-4 py-2.5 text-sm font-medium text-pm-muted hover:text-pm-text hover:border-pm-text/20 transition-all disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>

      {/* Premium upsell for free users */}
      {!hasPremium && (
        <div className="rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-[3px] border-l-pm-accent">
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-pm-accent text-white px-8 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 w-full sm:w-auto"
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
