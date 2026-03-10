'use client';

import { useEffect, useState } from 'react';

interface Photo {
  url: string;
  attributions: any[];
}

interface Review {
  author: string;
  rating: number;
  text: string;
  time: string;
  profilePhoto: string | null;
}

interface PlacesData {
  photos: Photo[];
  rating: number | null;
  reviewCount: number;
  reviews: Review[];
  googleMapsUrl: string | null;
  openNow: boolean | null;
  hours: string[];
}

interface Props {
  venueName: string;
  city: string;
}

export default function GooglePlacesData({ venueName, city }: Props) {
  const [data, setData] = useState<PlacesData | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/places?q=${encodeURIComponent(venueName + ' ' + city)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [venueName, city]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="aspect-[16/9] rounded-2xl bg-pm-bg-card animate-pulse" />
        <div className="h-20 rounded-xl bg-pm-bg-card animate-pulse" />
      </div>
    );
  }

  if (!data || (data.photos.length === 0 && !data.rating)) return null;

  return (
    <div className="space-y-6">
      {/* Photo Gallery */}
      {data.photos.length > 0 && (
        <div>
          {/* Main photo */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-pm-bg-card">
            <img
              src={data.photos[photoIndex]?.url}
              alt={`${venueName} - photo ${photoIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {data.photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIndex(i => i === 0 ? data.photos.length - 1 : i - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={() => setPhotoIndex(i => (i + 1) % data.photos.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {data.photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === photoIndex ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
            {/* Open now badge */}
            {data.openNow !== null && (
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                data.openNow ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {data.openNow ? 'Open now' : 'Closed'}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {data.photos.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {data.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === photoIndex ? 'border-pm-accent' : 'border-transparent'
                  }`}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rating + Review Summary */}
      {data.rating && (
        <div className="flex items-center gap-4 rounded-xl border border-pm-border/40 bg-pm-bg-card p-4">
          <div className="text-center">
            <div className="font-serif text-3xl font-bold text-pm-text">{data.rating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`text-sm ${s <= Math.round(data.rating!) ? 'text-pm-accent' : 'text-pm-ash'}`}>★</span>
              ))}
            </div>
            <div className="text-[11px] text-pm-faint mt-1">{data.reviewCount} reviews</div>
          </div>
          <div className="flex-1 border-l border-pm-border/40 pl-4">
            <div className="text-xs font-medium text-pm-text">Google Reviews</div>
            <p className="text-[11px] text-pm-faint mt-0.5">
              Rating and reviews from Google Maps
            </p>
            {data.googleMapsUrl && (
              <a href={data.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-pm-accent hover:text-pm-text transition-colors mt-1 inline-block">
                View on Google Maps →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      {data.reviews.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-pm-text mb-3">Player reviews</h3>
          <div className="space-y-2">
            {data.reviews.slice(0, 3).map((review, i) => (
              <div key={i} className="rounded-xl border border-pm-border/30 bg-white p-4">
                <div className="flex items-center gap-2.5">
                  {review.profilePhoto ? (
                    <img src={review.profilePhoto} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-pm-bg-card border border-pm-border flex items-center justify-center text-[11px] font-semibold text-pm-muted">
                      {review.author.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-pm-text truncate">{review.author}</span>
                      <span className="text-[10px] text-pm-faint">{review.time}</span>
                    </div>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={`text-[10px] ${s <= review.rating ? 'text-pm-accent' : 'text-pm-ash'}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                {review.text && (
                  <p className="mt-2 text-[13px] text-pm-muted leading-relaxed line-clamp-3">{review.text}</p>
                )}
              </div>
            ))}
          </div>
          {data.reviews.length > 3 && data.googleMapsUrl && (
            <a href={data.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-pm-accent hover:text-pm-text transition-colors mt-2 inline-block">
              View all {data.reviewCount} reviews on Google →
            </a>
          )}
        </div>
      )}

      {/* Opening Hours */}
      {data.hours.length > 0 && (
        <details className="rounded-xl border border-pm-border/30 bg-white overflow-hidden">
          <summary className="px-4 py-3 text-sm font-medium text-pm-text cursor-pointer hover:bg-pm-bg-hover transition-colors">
            Opening hours
            {data.openNow !== null && (
              <span className={`ml-2 text-xs ${data.openNow ? 'text-emerald-600' : 'text-red-500'}`}>
                {data.openNow ? '· Open now' : '· Closed'}
              </span>
            )}
          </summary>
          <div className="px-4 pb-3 space-y-1">
            {data.hours.map((h, i) => (
              <div key={i} className="text-xs text-pm-muted">{h}</div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
