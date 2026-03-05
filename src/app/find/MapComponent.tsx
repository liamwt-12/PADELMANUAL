'use client';

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon path issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

// Custom marker icons
const defaultIcon = L.divIcon({
  className: 'pm-marker',
  html: `<div style="width:12px;height:12px;background:#1A1A2E;border:2px solid #C4A35A;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const hoverIcon = L.divIcon({
  className: 'pm-marker-hover',
  html: `<div style="width:16px;height:16px;background:#C4A35A;border:2px solid #1A1A2E;border-radius:50%;box-shadow:0 2px 8px rgba(196,163,90,0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const selectedIcon = L.divIcon({
  className: 'pm-marker-selected',
  html: `<div style="width:20px;height:20px;background:#C4A35A;border:3px solid #1A1A2E;border-radius:50%;box-shadow:0 3px 12px rgba(196,163,90,0.6);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function MapComponent({ listings, hoveredId, selectedId, onSelect }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [53.5, -2.0], // Centre of UK
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
    });

    // Use a clean, minimal tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when listings change
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    // Add new markers
    listings.forEach(listing => {
      if (!listing.lat || !listing.lng) return;

      const marker = L.marker([listing.lat, listing.lng], { icon: defaultIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Georgia,serif;min-width:160px;">
            <strong style="color:#1A1A2E;font-size:13px;">${listing.name}</strong>
            <br/>
            <span style="color:#888;font-size:11px;">${listing.city || ''}</span>
            ${listing.courts ? `<br/><span style="color:#666;font-size:11px;">${listing.courts} court${listing.courts !== 1 ? 's' : ''}</span>` : ''}
            ${listing.indoor !== null ? `<br/><span style="color:#666;font-size:11px;">${listing.indoor ? '🏢 Indoor' : '🌤 Outdoor'}</span>` : ''}
            <br/><a href="/${listing.slug}" style="color:#C4A35A;font-size:11px;text-decoration:none;">View listing →</a>
          </div>
        `, { closeButton: false });

      marker.on('click', () => onSelect(listing.id));

      markersRef.current.set(listing.id, marker);
    });

    // Fit bounds if we have markers
    if (listings.length > 0) {
      const bounds = L.latLngBounds(
        listings
          .filter(l => l.lat && l.lng)
          .map(l => [l.lat, l.lng] as [number, number])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    }
  }, [listings, onSelect]);

  // Update marker icons on hover/select
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

    // Pan to selected marker
    if (selectedId) {
      const marker = markersRef.current.get(selectedId);
      if (marker && mapRef.current) {
        const ll = marker.getLatLng();
        mapRef.current.panTo(ll, { animate: true });
        marker.openPopup();
      }
    }
  }, [hoveredId, selectedId]);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ minHeight: '400px' }} />
  );
}
