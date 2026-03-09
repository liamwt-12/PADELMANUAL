'use client';

import { useEffect, useState } from 'react';

interface Props {
  venues: { lat: number; lng: number }[];
}

const B = { minLat: 49.9, maxLat: 58.7, minLng: -7.6, maxLng: 1.8 };
const W = 340, H = 520;

function proj(lat: number, lng: number) {
  const pad = 0.05;
  const x = pad * W + ((lng - B.minLng) / (B.maxLng - B.minLng)) * W * (1 - 2 * pad);
  const y = pad * H + (1 - (lat - B.minLat) / (B.maxLat - B.minLat)) * H * (1 - 2 * pad);
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

export default function HeroMap({ venues }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const valid = venues.filter(v => v.lat > B.minLat && v.lat < B.maxLat && v.lng > B.minLng && v.lng < B.maxLng);
  // Shuffle deterministically by lat
  const sorted = [...valid].sort((a, b) => (a.lat * 1000 + a.lng) - (b.lat * 1000 + b.lng));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="absolute right-0 top-0 h-full w-auto max-w-[65%] sm:max-w-[55%] md:max-w-[45%]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease-out' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Fade mask so dots blend into background at edges */}
        <radialGradient id="fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="75%" stopColor="white" stopOpacity="0.8" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="fadeMask">
          <rect width={W} height={H} fill="url(#fade)" />
        </mask>
      </defs>

      <g mask="url(#fadeMask)">
        {sorted.map((v, i) => {
          const { x, y } = proj(v.lat, v.lng);
          const delay = (i / sorted.length) * 2; // 0-2s stagger
          return (
            <g key={i}>
              {/* Glow */}
              <circle
                cx={x} cy={y} r="6"
                fill="#c4956a"
                opacity="0"
                style={{
                  animation: visible ? `dotPulse 3s ease-in-out ${delay}s infinite` : 'none',
                }}
              />
              {/* Core dot */}
              <circle
                cx={x} cy={y} r="2.2"
                fill="#1c1917"
                opacity="0"
                style={{
                  animation: visible ? `dotAppear 0.6s ease-out ${delay}s forwards` : 'none',
                }}
              />
              {/* Accent center */}
              <circle
                cx={x} cy={y} r="1"
                fill="#c4956a"
                opacity="0"
                style={{
                  animation: visible ? `dotAppear 0.6s ease-out ${delay}s forwards` : 'none',
                }}
              />
            </g>
          );
        })}
      </g>

      <style>{`
        @keyframes dotAppear {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 0.7; transform: scale(1); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.06; }
          50% { opacity: 0.14; }
        }
      `}</style>
    </svg>
  );
}
