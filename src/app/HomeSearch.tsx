'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  cities: string[];
  venueCount: number;
}

export default function HomeSearch({ cities, venueCount }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.length > 0
    ? cities.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : cities.slice(0, 6);

  function go(city?: string) {
    if (city) {
      window.location.href = `/find?city=${encodeURIComponent(city)}`;
    } else if (query) {
      window.location.href = `/find?search=${encodeURIComponent(query)}`;
    } else {
      window.location.href = '/find';
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const match = cities.find(c => c.toLowerCase() === query.toLowerCase());
      go(match || undefined);
    }
  }

  return (
    <div className="relative max-w-lg">
      <div className={`flex items-center rounded-2xl border bg-white transition-all ${
        focused ? 'border-pm-accent shadow-lg shadow-pm-accent/10' : 'border-pm-border shadow-sm'
      }`}>
        <svg className="ml-4 w-5 h-5 text-pm-faint shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 200); }}
          onKeyDown={handleKeyDown}
          placeholder="Search city, venue, or postcode..."
          className="flex-1 px-3 py-4 text-base bg-transparent outline-none placeholder:text-pm-ash"
        />
        <button
          onClick={() => go()}
          className="mr-2 rounded-xl bg-pm-text text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          Search
        </button>
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-pm-border bg-white shadow-lg z-20 overflow-hidden">
          {filtered.map(city => (
            <button
              key={city}
              onMouseDown={() => go(city)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-pm-bg-hover transition-colors flex items-center justify-between"
            >
              <span className="font-medium text-pm-text">{city}</span>
              <span className="text-xs text-pm-faint">View venues →</span>
            </button>
          ))}
          <button
            onMouseDown={() => go()}
            className="w-full text-left px-4 py-3 text-xs text-pm-accent hover:bg-pm-bg-hover transition-colors border-t border-pm-border/40"
          >
            Browse all {venueCount} venues →
          </button>
        </div>
      )}
    </div>
  );
}
