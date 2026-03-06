'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;

interface Listing {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  city: string | null;
  courts: number | null;
  indoor: boolean | null;
}

interface Props {
  listings: Listing[];
  hoveredId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const COLORS = {
  text: '#1c1917',
  accent: '#c4956a',
  muted: '#78716c',
  faint: '#a8a29e',
  bg: '#faf9f6',
};

const makeIcon = (size: number, bg: string, border: string, shadow: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border:2px solid ${border};border-radius:50%;box-shadow:0 2px 8px ${shadow};transition:all 150ms ease;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const defaultIcon = makeIcon(10, COLORS.text, COLORS.accent, 'rgba(0,0,0,0.15)');
const hoverIcon = makeIcon(14, COLORS.accent, COLORS.text, 'rgba(196,149,106,0.3)');
const selectedIcon = makeIcon(18, COLORS.accent, COLORS.text, 'rgba(196,149,106,0.45)');

export default function MapComponent({ listings, hoveredId, selectedId, onSelect }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [53.5, -2.0],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    // Zoom control — top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Attribution — bottom right, compact
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://carto.com">CARTO</a>')
      .addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    listings.forEach(listing => {
      if (!listing.lat || !listing.lng) return;

      const details = [
        listing.city,
        listing.courts ? `${listing.courts} court${listing.courts !== 1 ? 's' : ''}` : null,
        listing.indoor !== null ? (listing.indoor ? 'Indoor' : 'Outdoor') : null,
      ].filter(Boolean).join(' · ');

      const marker = L.marker([listing.lat, listing.lng], { icon: defaultIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'DM Sans',system-ui,sans-serif;min-width:150px;padding:2px 0;">
            <div style="font-weight:600;color:${COLORS.text};font-size:13px;line-height:1.3;">${listing.name}</div>
            ${details ? `<div style="color:${COLORS.muted};font-size:11px;margin-top:3px;">${details}</div>` : ''}
            <a href="/${listing.slug}" style="display:inline-block;margin-top:6px;color:${COLORS.accent};font-size:11px;font-weight:500;text-decoration:none;">View listing →</a>
          </div>
        `, {
          closeButton: false,
          className: 'pm-popup',
          offset: [0, -4],
        });

      marker.on('click', () => onSelect(listing.id));
      markersRef.current.set(listing.id, marker);
    });

    if (listings.length > 0) {
      const bounds = L.latLngBounds(
        listings.filter(l => l.lat && l.lng).map(l => [l.lat, l.lng] as [number, number])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [listings, onSelect]);

  // Hover / select states
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      if (id === selectedId) {
        marker.setIcon(selectedIcon);
        marker.setZIndexOffset(2000);
      } else if (id === hoveredId) {
        marker.setIcon(hoverIcon);
        marker.setZIndexOffset(1000);
      } else {
        marker.setIcon(defaultIcon);
        marker.setZIndexOffset(0);
      }
    });

    if (selectedId) {
      const marker = markersRef.current.get(selectedId);
      if (marker && mapRef.current) {
        mapRef.current.panTo(marker.getLatLng(), { animate: true });
        marker.openPopup();
      }
    }
  }, [hoveredId, selectedId]);

  return <div ref={containerRef} className="w-full h-full" />;
}
