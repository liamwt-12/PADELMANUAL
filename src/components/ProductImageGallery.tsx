'use client'

import { useState } from 'react'

export default function ProductImageGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl border border-pm-border/30 bg-pm-bg-card flex items-center justify-center">
        <span className="text-5xl text-pm-ash">🎾</span>
      </div>
    )
  }

  return (
    <div>
      <div className="aspect-square rounded-2xl border border-pm-border/30 bg-white p-6 flex items-center justify-center overflow-hidden">
        <img
          src={images[selected]}
          alt={name}
          className="w-full h-full object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.slice(0, 6).map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`shrink-0 w-16 h-16 rounded-lg border overflow-hidden bg-white p-1 transition-all ${
                i === selected ? 'border-pm-accent' : 'border-pm-border/40 hover:border-pm-accent/40'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
