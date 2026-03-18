'use client'

import { useState, useCallback } from 'react'

type TimeWindow = 'now' | 'morning' | 'afternoon' | 'evening'

interface Slot {
  start_time: string
  duration: number
  price: string
  courts_available: number
  booking_url: string
}

interface Venue {
  id: string
  name: string
  slug: string
  distance_miles: number
  court_count: number | null
  indoor: boolean | null
  slots: Slot[]
  has_availability: boolean
  playtomic_url: string | null
}

interface SearchResult {
  venues: Venue[]
  search: {
    lat: number
    lng: number
    city: string
    window: string
    radius_miles: number
    venues_checked: number
    venues_with_availability: number
    generated_at: string
  }
}

function formatSlotTime(t: string): string {
  // t is "HH:MM" or "HH:MM:SS"
  const parts = t.split(':')
  const h = parseInt(parts[0])
  const m = parts[1] || '00'
  if (h === 0) return `12:${m}am`
  if (h < 12) return `${h}:${m}am`
  if (h === 12) return `12:${m}pm`
  return `${h - 12}:${m}pm`
}

function formatPrice(p: string): string {
  // Playtomic returns "EUR 45.00" or "GBP 22.00" or just "22.00"
  const match = p.match(/([\d.]+)/)
  if (!match) return p
  const num = parseFloat(match[1])
  return `£${Math.round(num)}`
}

const TIME_WINDOWS: { key: TimeWindow; label: string }[] = [
  { key: 'now', label: 'Now' },
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
]

export default function PlayTodayClient({ cities }: { cities: string[] }) {
  const [window, setWindow] = useState<TimeWindow>('now')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [locationLabel, setLocationLabel] = useState('')
  const [locationError, setLocationError] = useState('')
  const [geoGranted, setGeoGranted] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [postcode, setPostcode] = useState('')

  const search = useCallback(async (lat: number, lng: number, city: string, win: TimeWindow) => {
    setLoading(true)
    setLocationError('')
    try {
      const params = new URLSearchParams({ window: win, radius: '10' })
      if (lat && lng) {
        params.set('lat', String(lat))
        params.set('lng', String(lng))
      }
      if (city) params.set('city', city)

      const res = await fetch(`/api/play-today?${params}`)
      const data = await res.json()
      setResult(data)
    } catch {
      setLocationError('Failed to load availability. Try again.')
    }
    setLoading(false)
  }, [])

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser.')
      return
    }
    setLoading(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        setGeoGranted(true)
        setLocationLabel('your location')
        setSelectedCity('')
        search(latitude, longitude, '', window)
      },
      () => {
        setLocationError('Location access denied. Search by city instead.')
        setLoading(false)
      },
      { timeout: 10000 },
    )
  }

  function searchByCity(city: string) {
    setSelectedCity(city)
    setLocationLabel(city)
    setCoords(null)
    setGeoGranted(false)
    search(0, 0, city, window)
  }

  async function searchByPostcode() {
    if (!postcode.trim()) return
    setLoading(true)
    setLocationError('')
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`)
      const data = await res.json()
      if (data.status === 200 && data.result) {
        const { latitude, longitude } = data.result
        setCoords({ lat: latitude, lng: longitude })
        setLocationLabel(postcode.trim().toUpperCase())
        setSelectedCity('')
        search(latitude, longitude, '', window)
      } else {
        setLocationError('Postcode not found. Try a city instead.')
        setLoading(false)
      }
    } catch {
      setLocationError('Could not look up postcode.')
      setLoading(false)
    }
  }

  function changeWindow(w: TimeWindow) {
    setWindow(w)
    if (coords) {
      search(coords.lat, coords.lng, '', w)
    } else if (selectedCity) {
      search(0, 0, selectedCity, w)
    }
  }

  const venuesWithSlots = result?.venues.filter(v => v.has_availability) || []
  const venuesWithout = result?.venues.filter(v => !v.has_availability) || []
  const hasSearched = result !== null

  return (
    <main className="pb-10">
      {/* Hero */}
      <section className="pt-6 pb-8">
        <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Play Today
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-pm-muted">
          Find a padel court with slots available right now.
        </p>
      </section>

      {/* Location controls */}
      <section className="mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <button
            onClick={useMyLocation}
            disabled={loading}
            className="rounded-full bg-pm-text text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Use my location
          </button>

          <div className="flex items-center gap-2">
            <select
              value={selectedCity}
              onChange={e => e.target.value && searchByCity(e.target.value)}
              className="rounded-full border border-pm-border px-4 py-2.5 text-sm text-pm-muted bg-white focus:outline-none focus:border-pm-accent"
            >
              <option value="">Search by city</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={postcode}
              onChange={e => setPostcode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchByPostcode()}
              placeholder="Postcode"
              className="w-28 rounded-full border border-pm-border px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-accent"
            />
            <button
              onClick={searchByPostcode}
              disabled={loading || !postcode.trim()}
              className="rounded-full border border-pm-border px-4 py-2.5 text-sm text-pm-muted hover:text-pm-text hover:border-pm-accent/40 transition-all disabled:opacity-50"
            >
              Go
            </button>
          </div>
        </div>

        {locationError && (
          <p className="mt-3 text-sm text-red-500">{locationError}</p>
        )}
      </section>

      {/* Time window pills */}
      <section className="mb-8">
        <div className="flex gap-2">
          {TIME_WINDOWS.map(tw => (
            <button
              key={tw.key}
              onClick={() => changeWindow(tw.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                window === tw.key
                  ? 'bg-pm-text text-white'
                  : 'border border-pm-border text-pm-muted hover:border-pm-accent/40 hover:text-pm-text'
              }`}
            >
              {tw.label}
            </button>
          ))}
        </div>
      </section>

      {/* Loading state */}
      {loading && (
        <section>
          <p className="text-sm text-pm-muted mb-4">Finding available courts near you&hellip;</p>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-pm-border/30 bg-pm-bg-card p-6 animate-pulse">
                <div className="h-5 bg-pm-border/30 rounded w-48 mb-3" />
                <div className="h-3 bg-pm-border/20 rounded w-32 mb-4" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="h-9 w-20 bg-pm-border/20 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <section>
          {venuesWithSlots.length > 0 ? (
            <>
              <p className="text-sm text-pm-muted mb-6">
                {venuesWithSlots.length} court{venuesWithSlots.length !== 1 ? 's' : ''} available near {locationLabel}{' '}
                {window === 'now' ? 'right now' : `this ${window}`}
              </p>

              <div className="space-y-3">
                {venuesWithSlots.map(venue => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-pm-border/30 bg-pm-bg-card p-8 text-center">
              <p className="text-sm text-pm-muted">
                No courts available {window === 'now' ? 'right now' : `this ${window}`} near {locationLabel}.
              </p>
              <p className="mt-2 text-xs text-pm-faint">
                Try a different time window or expand your search.
              </p>
            </div>
          )}

          {/* Venues without Playtomic availability */}
          {venuesWithout.length > 0 && (
            <div className="mt-10">
              <div className="label-caps">More venues nearby</div>
              <p className="mt-1 text-xs text-pm-faint mb-4">
                These venues don&apos;t show live availability — check their website to book.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {venuesWithout.slice(0, 6).map(v => (
                  <a key={v.id} href={`/${v.slug}`} className="card block">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">
                        {v.indoor === true ? 'Indoor' : v.indoor === false ? 'Outdoor' : ''}
                        {v.court_count ? `${v.indoor !== null ? ' · ' : ''}${v.court_count} courts` : ''}
                      </span>
                      <span className="text-[10px] text-pm-faint">{v.distance_miles} miles</span>
                    </div>
                    <div className="mt-2 font-serif text-base font-semibold tracking-tight">{v.name}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Pre-search state */}
      {!loading && !hasSearched && (
        <section className="rounded-2xl border border-pm-border/30 bg-pm-bg-card p-8 text-center">
          <p className="text-sm text-pm-muted">
            Select your location to see available courts.
          </p>
        </section>
      )}
    </main>
  )
}

function VenueCard({ venue }: { venue: Venue }) {
  async function trackClick(listingId: string, slotTime: string) {
    fetch('/api/play-today/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, slot_time: slotTime }),
    }).catch(() => {})
  }

  return (
    <div className="rounded-2xl border border-pm-border/30 bg-pm-bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <a href={`/${venue.slug}`} className="font-serif text-lg font-semibold tracking-tight text-pm-text hover:text-pm-accent transition-colors">
            {venue.name}
          </a>
          <p className="mt-1 text-xs text-pm-faint">
            {venue.indoor === true ? 'Indoor' : venue.indoor === false ? 'Outdoor' : ''}
            {venue.court_count ? `${venue.indoor !== null ? ' · ' : ''}${venue.court_count} courts` : ''}
          </p>
        </div>
        <span className="text-sm text-pm-faint shrink-0">{venue.distance_miles} miles</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {venue.slots.slice(0, 8).map((slot, i) => (
          <a
            key={i}
            href={slot.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(venue.id, slot.start_time)}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/50 px-3.5 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all"
          >
            <span>{formatSlotTime(slot.start_time)}</span>
            <span className="text-[10px] text-emerald-500">{formatPrice(slot.price)}</span>
          </a>
        ))}
      </div>

      {venue.slots.length > 8 && (
        <a
          href={venue.playtomic_url || `/${venue.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-pm-accent hover:text-pm-text transition-colors"
        >
          +{venue.slots.length - 8} more slots →
        </a>
      )}
    </div>
  )
}
