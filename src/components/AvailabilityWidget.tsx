'use client';

import { useEffect, useState } from 'react';

interface Slot {
  time: string;
  price: string;
  duration: number;
  courts: number;
  day: string;
}

interface Props {
  tenantId: string;
  playtomicUrl: string;
  venueName: string;
}

function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  if (hour === 0) return '12am';
  if (hour < 12) return `${hour}${m === '00' ? '' : ':' + m}am`;
  if (hour === 12) return `12${m === '00' ? '' : ':' + m}pm`;
  return `${hour - 12}${m === '00' ? '' : ':' + m}pm`;
}

function formatPrice(p: string) {
  const match = p.match(/(\d+)/);
  return match ? `£${match[1]}` : p;
}

export default function AvailabilityWidget({ tenantId, playtomicUrl, venueName }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/availability?tenant_id=${tenantId}`)
      .then(r => r.json())
      .then(data => {
        setSlots(data.slots || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [tenantId]);

  if (error) return null;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <h3 className="text-sm font-semibold text-pm-text">Live availability</h3>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 rounded-lg bg-emerald-50 animate-pulse" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <p className="text-sm text-pm-muted">No slots available right now. Check back later or book directly.</p>
      ) : (
        <>
          <div className="space-y-1.5">
            {slots.slice(0, 6).map((slot, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white border border-emerald-100/60">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {slot.day}
                  </span>
                  <span className="text-sm font-semibold text-pm-text">
                    {formatTime(slot.time)}
                  </span>
                  <span className="text-xs text-pm-faint">
                    {slot.duration}min
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-pm-muted">
                    {slot.courts} court{slot.courts !== 1 ? 's' : ''}
                  </span>
                  <span className="text-sm font-semibold text-pm-text">
                    {formatPrice(slot.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <a
            href={playtomicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full text-center rounded-full bg-emerald-600 text-white px-5 py-3 text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Book on Playtomic →
          </a>

          <p className="mt-2 text-[10px] text-pm-faint text-center">
            Live data from Playtomic · Updated every 5 minutes
          </p>
        </>
      )}
    </div>
  );
}
