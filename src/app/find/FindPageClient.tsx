'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-pm-bg flex items-center justify-center">
      <div className="text-pm-faint text-sm font-sans animate-pulse">Loading map…</div>
    </div>
  ),
});

interface Listing {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  city: string | null;
  region: string | null;
  courts: number | null;
  indoor: boolean | null;
  booking_platform: string | null;
  playtomic_url: string | null;
  listing_type: string;
  claimed: boolean;
  premium: boolean;
  postcode: string | null;
  address: string | null;
}

interface Props {
  listings: Listing[];
  cities: string[];
}

/* normalise postcode for fuzzy matching: "SW1A 1AA" → "sw1a1aa" */
function normPC(s: string | null) {
  return s ? s.replace(/\s+/g, '').toLowerCase() : '';
}

export default function FindPageClient({ listings, cities }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [indoorFilter, setIndoorFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'venue' | 'coach'>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list'); // mobile view toggle
  const [filtersOpen, setFiltersOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (search) {
        const q = search.toLowerCase().replace(/\s+/g, '');
        const qSpaced = search.toLowerCase();
        const match =
          l.name?.toLowerCase().includes(qSpaced) ||
          l.city?.toLowerCase().includes(qSpaced) ||
          normPC(l.postcode).includes(q) ||
          l.postcode?.toLowerCase().includes(qSpaced) ||
          l.address?.toLowerCase().includes(qSpaced) ||
          l.region?.toLowerCase().includes(qSpaced);
        if (!match) return false;
      }
      if (selectedCity && l.city !== selectedCity) return false;
      if (indoorFilter === 'indoor' && !l.indoor) return false;
      if (indoorFilter === 'outdoor' && l.indoor) return false;
      if (typeFilter !== 'all' && l.listing_type !== typeFilter) return false;
      return true;
    });
  }, [listings, search, selectedCity, indoorFilter, typeFilter]);

  useEffect(() => {
    if (selectedId && listRef.current) {
      const el = listRef.current.querySelector(`[data-id="${selectedId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  const onMarkerSelect = useCallback((id: string) => {
    setSelectedId(id);
    setView('list');
  }, []);

  const venueCount = filtered.length;
  const courtCount = filtered.reduce((sum, l) => sum + (l.courts || 0), 0);
  const hasActiveFilters = selectedCity || indoorFilter !== 'all' || typeFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setSelectedCity('');
    setIndoorFilter('all');
    setTypeFilter('all');
  };

  return (
    /* Break out of the max-w-[960px] layout container */
    <div className="find-page -mx-6 -mb-16" style={{ width: 'calc(100% + 3rem)' }}>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>

        {/* ─── Top Bar ─── */}
        <div className="border-b border-pm-border bg-pm-bg px-4 py-3 shrink-0 z-20">
          {/* Search row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pm-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, city, or postcode…"
                className="w-full pl-9 pr-3 py-2.5 text-sm font-sans border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent focus:ring-1 focus:ring-pm-accent/20 placeholder:text-pm-ash transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pm-ash hover:text-pm-muted transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-sans border rounded-xl transition-colors shrink-0 ${
                hasActiveFilters
                  ? 'border-pm-accent bg-pm-accent/5 text-pm-accent'
                  : 'border-pm-border bg-white text-pm-muted hover:border-pm-accent/40'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-pm-accent" />
              )}
            </button>

            {/* Stats — desktop */}
            <div className="hidden md:flex items-center text-xs text-pm-faint font-sans shrink-0">
              <span className="font-medium text-pm-muted">{venueCount}</span>
              <span className="ml-1">venue{venueCount !== 1 ? 's' : ''}</span>
              {courtCount > 0 && (
                <>
                  <span className="mx-1.5 text-pm-ash">·</span>
                  <span className="font-medium text-pm-muted">{courtCount}</span>
                  <span className="ml-1">courts</span>
                </>
              )}
            </div>
          </div>

          {/* Collapsible filter row */}
          {filtersOpen && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-pm-border/60">
              {/* City */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 text-sm font-sans border border-pm-border rounded-xl bg-white text-pm-text focus:outline-none focus:border-pm-accent"
              >
                <option value="">All cities</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Indoor / Outdoor */}
              <div className="flex rounded-xl border border-pm-border overflow-hidden text-sm font-sans">
                {(['all', 'indoor', 'outdoor'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setIndoorFilter(opt)}
                    className={`px-3 py-2 capitalize transition-colors ${
                      indoorFilter === opt
                        ? 'bg-pm-text text-white'
                        : 'bg-white text-pm-muted hover:bg-pm-bg-hover'
                    }`}
                  >
                    {opt === 'all' ? 'All' : opt}
                  </button>
                ))}
              </div>

              {/* Type */}
              <div className="flex rounded-xl border border-pm-border overflow-hidden text-sm font-sans">
                {(['all', 'venue', 'coach'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setTypeFilter(opt)}
                    className={`px-3 py-2 capitalize transition-colors ${
                      typeFilter === opt
                        ? 'bg-pm-text text-white'
                        : 'bg-white text-pm-muted hover:bg-pm-bg-hover'
                    }`}
                  >
                    {opt === 'all' ? 'All' : opt === 'venue' ? 'Courts' : 'Coaches'}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-pm-accent hover:text-pm-text font-sans transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─── Content: List + Map ─── */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* Sidebar list */}
          <div
            ref={listRef}
            className={`w-full sm:w-[360px] lg:w-[400px] overflow-y-auto bg-white border-r border-pm-border shrink-0 ${
              view === 'list' ? 'block' : 'hidden sm:block'
            }`}
          >
            {/* Mobile stats bar */}
            <div className="sm:hidden px-4 py-2 bg-pm-bg border-b border-pm-border/60 text-xs text-pm-faint font-sans">
              <span className="font-medium text-pm-muted">{venueCount}</span> venue{venueCount !== 1 ? 's' : ''}
              {courtCount > 0 && <> · <span className="font-medium text-pm-muted">{courtCount}</span> courts</>}
            </div>

            {filtered.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-pm-ash mb-2">
                  <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-pm-muted text-sm font-sans">No venues found</p>
                <p className="text-pm-faint text-xs mt-1 font-sans">Try a different search or filter</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="mt-3 text-xs text-pm-accent hover:underline font-sans">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filtered.map((listing) => (
                <a
                  key={listing.id}
                  href={`/${listing.slug}`}
                  data-id={listing.id}
                  onMouseEnter={() => setHoveredId(listing.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`block px-4 py-3.5 border-b border-pm-border/40 transition-colors ${
                    selectedId === listing.id
                      ? 'bg-pm-accent/[0.06]'
                      : hoveredId === listing.id
                      ? 'bg-pm-bg-hover'
                      : 'hover:bg-pm-bg-hover'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-pm-text leading-tight truncate font-sans">
                        {listing.name}
                      </h3>
                      <p className="text-xs text-pm-muted mt-0.5 font-sans truncate">
                        {[listing.city, listing.region].filter(Boolean).join(', ')}
                        {listing.postcode && (
                          <span className="text-pm-faint ml-1">{listing.postcode}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                      {listing.courts != null && listing.courts > 0 && (
                        <span className="text-[11px] text-pm-muted bg-pm-bg px-2 py-0.5 rounded-md font-sans border border-pm-border/40">
                          {listing.courts} court{listing.courts !== 1 ? 's' : ''}
                        </span>
                      )}
                      {listing.indoor !== null && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-sans font-medium ${
                          listing.indoor
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                            : 'text-sky-700 bg-sky-50 border border-sky-100'
                        }`}>
                          {listing.indoor ? 'Indoor' : 'Outdoor'}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>

          {/* Map */}
          <div className={`flex-1 min-w-0 ${view === 'map' ? 'block' : 'hidden sm:block'}`}>
            <MapComponent
              listings={filtered}
              hoveredId={hoveredId}
              selectedId={selectedId}
              onSelect={onMarkerSelect}
            />
          </div>

          {/* ─── Mobile floating toggle ─── */}
          <div className="sm:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
            <button
              onClick={() => setView(view === 'list' ? 'map' : 'list')}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-pm-text text-white text-sm font-sans font-medium shadow-lg shadow-black/20 active:scale-95 transition-transform"
            >
              {view === 'list' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Show Map
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Show List
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
