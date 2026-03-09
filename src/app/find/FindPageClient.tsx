'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#f0eeeb] flex items-center justify-center">
      <div className="text-pm-faint text-sm animate-pulse">Loading map…</div>
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

function normPC(s: string | null) {
  return s ? s.replace(/\s+/g, '').toLowerCase() : '';
}

export default function FindPageClient({ listings, cities }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [indoorFilter, setIndoorFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (search) {
        const q = search.toLowerCase();
        const qStrip = q.replace(/\s+/g, '');
        const match =
          l.name?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q) ||
          normPC(l.postcode).includes(qStrip) ||
          l.address?.toLowerCase().includes(q) ||
          l.region?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedCity && l.city !== selectedCity) return false;
      if (indoorFilter === 'indoor' && !l.indoor) return false;
      if (indoorFilter === 'outdoor' && l.indoor) return false;
      return true;
    });
  }, [listings, search, selectedCity, indoorFilter]);

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Search + Filter Bar ── */}
      <div className="shrink-0 bg-pm-bg px-4 py-3 border-b border-pm-border/60 z-10">
        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1 min-w-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pm-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, city, or postcode…"
              className="w-full pl-9 pr-8 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent placeholder:text-pm-ash"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-pm-ash hover:text-pm-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`shrink-0 p-2.5 border rounded-xl transition-colors ${
              selectedCity || indoorFilter !== 'all'
                ? 'border-pm-accent bg-pm-accent/5 text-pm-accent'
                : 'border-pm-border bg-white text-pm-muted hover:text-pm-text'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          </button>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-pm-border/40">
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="px-3 py-2 text-sm border border-pm-border rounded-xl bg-white">
              <option value="">All cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex rounded-xl border border-pm-border overflow-hidden text-sm">
              {(['all', 'indoor', 'outdoor'] as const).map(opt => (
                <button key={opt} onClick={() => setIndoorFilter(opt)} className={`px-3 py-2 capitalize ${indoorFilter === opt ? 'bg-pm-text text-white' : 'bg-white text-pm-muted hover:bg-pm-bg-hover'}`}>
                  {opt === 'all' ? 'All' : opt}
                </button>
              ))}
            </div>
            {(selectedCity || indoorFilter !== 'all') && (
              <button onClick={() => { setSelectedCity(''); setIndoorFilter('all'); }} className="text-xs text-pm-accent hover:underline px-2">Clear</button>
            )}
          </div>
        )}

        {/* Count bar */}
        <div className="flex items-center justify-between mt-2 text-xs text-pm-faint">
          <span>
            <span className="font-medium text-pm-muted">{venueCount}</span> venue{venueCount !== 1 ? 's' : ''}
            {courtCount > 0 && <> · <span className="font-medium text-pm-muted">{courtCount}</span> courts</>}
          </span>
          <a href="/quiz" className="text-pm-accent hover:text-pm-text transition-colors hidden sm:inline">Take the racket quiz →</a>
        </div>
      </div>

      {/* ── Split: List + Map ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* List panel */}
        <div
          ref={listRef}
          className={`w-full sm:w-[380px] lg:w-[420px] shrink-0 overflow-y-auto overflow-x-hidden bg-white ${
            view === 'list' ? 'block' : 'hidden sm:block'
          }`}
        >
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-pm-muted text-sm font-medium">No venues found</p>
              <p className="text-pm-faint text-xs mt-1">Try a different search or clear filters</p>
            </div>
          ) : (
            filtered.map((listing) => (
              <a
                key={listing.id}
                href={`/${listing.slug}`}
                data-id={listing.id}
                onMouseEnter={() => setHoveredId(listing.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`block px-4 py-3.5 border-b border-pm-border/30 transition-colors ${
                  selectedId === listing.id ? 'bg-pm-accent/[0.06]' : hoveredId === listing.id ? 'bg-pm-bg-hover' : 'hover:bg-pm-bg-hover'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-semibold text-pm-text leading-snug">
                      {listing.name}
                      {listing.premium && <span className="inline-block ml-1.5 w-1.5 h-1.5 bg-pm-accent rounded-full align-middle" />}
                    </h3>
                    <p className="text-[11px] text-pm-muted mt-0.5 leading-snug">
                      {[listing.city, listing.region].filter(Boolean).join(', ')}
                      {listing.postcode && <span className="text-pm-faint ml-1">{listing.postcode}</span>}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                    {listing.courts != null && listing.courts > 0 && (
                      <span className="text-[10px] text-pm-muted bg-pm-bg px-1.5 py-0.5 rounded border border-pm-border/30">
                        {listing.courts}ct
                      </span>
                    )}
                    {listing.indoor !== null && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        listing.indoor ? 'text-emerald-700 bg-emerald-50' : 'text-sky-700 bg-sky-50'
                      }`}>
                        {listing.indoor ? 'In' : 'Out'}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))
          )}

          {/* Bottom CTA in list */}
          {filtered.length > 0 && (
            <div className="p-4 border-t border-pm-border/30 bg-pm-bg">
              <p className="text-[11px] text-pm-faint text-center">
                Own a venue? <a href="mailto:hello@padelmanual.com" className="text-pm-accent hover:underline">Claim your free listing</a>
              </p>
            </div>
          )}
        </div>

        {/* Map panel */}
        <div className={`flex-1 min-w-0 ${view === 'map' ? 'block' : 'hidden sm:block'}`}>
          <MapComponent listings={filtered} hoveredId={hoveredId} selectedId={selectedId} onSelect={onMarkerSelect} />
        </div>

        {/* Mobile floating toggle */}
        <div className="sm:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setView(view === 'list' ? 'map' : 'list')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-pm-text text-white text-sm font-medium shadow-lg shadow-black/20 active:scale-95 transition-transform"
          >
            {view === 'list' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                Show Map
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                Show List
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
