'use client'

import { useState } from 'react'

interface Props {
  images: string[]
  venueName: string
}

export default function ListingImageGallery({ images, venueName }: Props) {
  const [photoIndex, setPhotoIndex] = useState(0)

  if (images.length === 0) return null

  return (
    <div>
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-pm-bg-card">
        <img
          src={images[photoIndex]}
          alt={`${venueName} - photo ${photoIndex + 1}`}
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setPhotoIndex(i => i === 0 ? images.length - 1 : i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              &#8249;
            </button>
            <button
              onClick={() => setPhotoIndex(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              &#8250;
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === photoIndex ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setPhotoIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === photoIndex ? 'border-pm-accent' : 'border-transparent'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
