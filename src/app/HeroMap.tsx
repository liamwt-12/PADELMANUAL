'use client';

import { useEffect, useRef } from 'react';

interface Props {
  venues: { lat: number; lng: number }[];
}

const B = { minLat: 49.9, maxLat: 58.7, minLng: -7.6, maxLng: 1.8 };

function project(lat: number, lng: number, w: number, h: number) {
  const pad = 0.06;
  const x = pad * w + ((lng - B.minLng) / (B.maxLng - B.minLng)) * w * (1 - 2 * pad);
  const y = pad * h + (1 - (lat - B.minLat) / (B.maxLat - B.minLat)) * h * (1 - 2 * pad);
  return { x, y };
}

export default function HeroMap({ venues }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !venues.length) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d')!;
    const valid = venues.filter(v => v.lat > B.minLat && v.lat < B.maxLat && v.lng > B.minLng && v.lng < B.maxLng);
    const shuffled = [...valid].sort(() => Math.random() - 0.5);

    const accent = { r: 196, g: 149, b: 106 };
    const dark = { r: 28, g: 25, b: 23 };
    let t0 = 0;

    function draw(ts: number) {
      if (!t0) t0 = ts;
      const el = ts - t0;
      const r = canvas!.getBoundingClientRect();
      const w = r.width, h = r.height;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const progress = Math.min(el / 2500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const count = Math.floor(eased * shuffled.length);
      const pulse = 0.12 + 0.08 * Math.sin((el % 4000) / 4000 * Math.PI * 2);

      for (let i = 0; i < count; i++) {
        const { x, y } = project(shuffled[i].lat, shuffled[i].lng, w, h);
        const fade = Math.min((count - i) / 15, 1);

        // Glow ring for freshly appeared
        if (fade < 1 && progress < 1) {
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${accent.r},${accent.g},${accent.b},${0.12 * (1 - fade)})`;
          ctx.fill();
        }

        // Ambient pulse
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent.r},${accent.g},${accent.b},${pulse * fade})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dark.r},${dark.g},${dark.b},${0.65 * fade})`;
        ctx.fill();

        // Accent center
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent.r},${accent.g},${accent.b},${fade})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [venues]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.55 }} />;
}
