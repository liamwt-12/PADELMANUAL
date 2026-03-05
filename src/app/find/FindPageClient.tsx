'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-pm-stone/30 flex items-center justify-center">
      <div className="text-pm-warm text-sm animate-pulse">Loading map...</div>
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

export default function FindPageClient({ listings, cities }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [indoorFilter, setIndoorFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'venue' | 'coach'>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (search) {
        const q = search.toLowerCase();
        const match = l.name?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q) ||
          l.postcode?.toLowerCase().includes(q) ||
          l.address?.toLowerCase().includes(q) ||
          l.region?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedCity && l.city !== selectedCity) return false;
      if (indoorFilter === 'indoor' && !l.indoor) return false;
      if (indoorFilter === 'outdoor' && l.indoor) return false;
      if (typeFilter !== 'all' && l.listing_type !== typeFilter) return false;
      return true;
    });
  }, [listings, search, selectedCity, indoorFilter, typeFilter]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedId && listRef.current) {
      const el = listRef.current.querySelector(`[data-id="${selectedId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  const venueCount = filtered.length;
  const courtCount = filtered.reduce((sum, l) => sum + (l.courts || 0), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* ─── Filter Bar ─── */}
      <div className="border-b border-pm-brass/10 bg-white px-4 py-3 flex flex-wrap items-center gap-3 z-10">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[360px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pm-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, city, or postcode..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-pm-brass/15 rounded-lg focus:outline-none focus:border-pm-brass bg-pm-stone/20 placeholder:text-pm-warm/50 font-serif"
          />
        </div>

        {/* City picker */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-3 py-2 text-sm border border-pm-brass/15 rounded-lg bg-pm-stone/20 text-pm-dark focus:outline-none focus:border-pm-brass font-serif"
        >
          <option value="">All cities</option>
          {cities.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Indoor/Outdoor */}
        <div className="flex rounded-lg border border-pm-brass/15 overflow-hidden text-sm">
          {(['all', 'indoor', 'outdoor'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setIndoorFilter(opt)}
              className={`px-3 py-2 font-serif capitalize transition-colors ${
                indoorFilter === opt
                  ? 'bg-pm-dark text-white'
                  : 'bg-pm-stone/20 text-pm-warm hover:bg-pm-stone/40'
              }`}
            >
              {opt === 'all' ? 'All' : opt}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex rounded-lg border border-pm-brass/15 overflow-hidden text-sm">
          {(['all', 'venue', 'coach'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setTypeFilter(opt)}
              className={`px-3 py-2 font-serif capitalize transition-colors ${
                typeFilter === opt
                  ? 'bg-pm-dark text-white'
                  : 'bg-pm-stone/20 text-pm-warm hover:bg-pm-stone/40'
              }`}
            >
              {opt === 'all' ? 'All' : opt === 'venue' ? 'Courts' : 'Coaches'}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="text-xs text-pm-warm font-serif ml-auto hidden sm:block">
          {venueCount} venue{venueCount !== 1 ? 's' : ''}
          {courtCount > 0 && <> &middot; {courtCount} courts</>}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setShowList(!showList)}
          className="sm:hidden px-3 py-2 text-sm border border-pm-brass/15 rounded-lg bg-pm-stone/20 text-pm-dark font-serif"
        >
          {showList ? 'Map' : 'List'}
        </button>
      </div>

      {/* ─── Map + List ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar list */}
        <div
          ref={listRef}
          className={`w-full sm:w-[380px] lg:w-[420px] overflow-y-auto border-r border-pm-brass/10 bg-white ${
            showList ? 'block' : 'hidden sm:block'
          }`}
        >
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-pm-warm text-sm font-serif">No venues found</p>
              <p className="text-pm-warm/50 text-xs mt-1 font-serif">Try adjusting your filters</p>
            </div>
          ) : (
            filtered.map((listing) => (
              <Link
                key={listing.id}
                href={`/${listing.slug}`}
                data-id={listing.id}
                onMouseEnter={() => setHoveredId(listing.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedId(listing.id)}
                className={`block px-4 py-3.5 border-b border-pm-brass/5 transition-colors cursor-pointer ${
                  selectedId === listing.id
                    ? 'bg-pm-brass/10'
                    : hoveredId === listing.id
                    ? 'bg-pm-stone/30'
                    : 'hover:bg-pm-stone/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-serif text-sm text-pm-dark leading-tight truncate">
                      {listing.name}
                      {listing.premium && (
                        <span className="inline-block ml-1.5 w-1.5 h-1.5 bg-pm-brass rounded-full align-middle" />
                      )}
                    </h3>
                    <p className="text-xs text-pm-warm mt-0.5 font-serif">
                      {[listing.city, listing.region].filter(Boolean).join(', ')}
                      {listing.postcode && <span className="ml-1 text-pm-warm/50">{listing.postcode}</span>}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    {listing.courts && (
                      <span className="text-[11px] text-pm-warm bg-pm-stone/40 px-1.5 py-0.5 rounded font-serif">
                        {listing.courts} court{listing.courts !== 1 ? 's' : ''}
                      </span>
                    )}
                    {listing.indoor !== null && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-serif ${
                        listing.indoor
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-sky-700 bg-sky-50'
                      }`}>
                        {listing.indoor ? 'Indoor' : 'Outdoor'}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Map */}
        <div className={`flex-1 ${!showList ? 'block' : 'hidden sm:block'}`}>
          <MapComponent
            listings={filtered}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setShowList(true);
            }}
          />
        </div>
      </div>
    </div>
  );
}
