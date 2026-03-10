'use client';

import { useEffect } from 'react';

interface Props {
  slug: string;
}

export default function ViewTracker({ slug }: Props) {
  useEffect(() => {
    // Track page view
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, type: 'view' }),
    }).catch(() => {});

    // Track booking clicks via event delegation
    function handleClick(e: MouseEvent) {
      const link = (e.target as HTMLElement).closest('a[href*="playtomic"], a[href*="booking"]');
      if (link) {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, type: 'click' }),
        }).catch(() => {});
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [slug]);

  return null; // Invisible component
}
