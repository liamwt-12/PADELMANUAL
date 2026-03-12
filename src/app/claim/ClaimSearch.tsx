'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Result = {
  id: string
  name: string
  slug: string
  city: string | null
  claimed: boolean
}

export default function ClaimSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { data } = await supabase
      .from('listings')
      .select('id, name, slug, city, claimed')
      .eq('listing_type', 'venue')
      .ilike('name', `%${query.trim()}%`)
      .limit(10)

    setResults((data as Result[]) || [])
    setSearched(true)
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for your venue name..."
          className="flex-1 px-4 py-3 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary text-sm px-6 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searched && results.length === 0 && (
        <div className="mt-6 rounded-2xl border border-pm-border bg-pm-bg-card p-6 text-center">
          <p className="text-sm text-pm-muted">No venues found matching &ldquo;{query}&rdquo;</p>
          <p className="mt-2 text-xs text-pm-faint">
            Can&apos;t find your venue?{' '}
            <a href="/venues/add" className="text-pm-accent hover:underline font-medium">Add it here →</a>
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4 rounded-2xl border border-pm-border bg-pm-bg-card divide-y divide-pm-border/40">
          {results.map(venue => (
            <a
              key={venue.id}
              href={`/${venue.slug}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-pm-bg-hover transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div>
                <p className="text-sm font-medium text-pm-text">{venue.name}</p>
                {venue.city && (
                  <p className="text-xs text-pm-faint mt-0.5">{venue.city}</p>
                )}
              </div>
              {venue.claimed ? (
                <span className="text-[10px] text-pm-faint bg-pm-bg-hover rounded-full px-2.5 py-0.5">
                  Claimed
                </span>
              ) : (
                <span className="text-xs text-pm-accent font-medium">
                  Claim →
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
