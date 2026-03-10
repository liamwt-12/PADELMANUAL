'use client';

import { useState } from 'react';

const links = [
  { label: "Find Courts", href: "/find" },
  { label: "Gear Guides", href: "/gear" },
  { label: "Shop", href: "/gear/shop" },
  { label: "Racket Quiz", href: "/quiz" },
  { label: "Padel vs Tennis", href: "/guides/padel-vs-tennis" },
  { label: "Padel Rules", href: "/guides/padel-rules" },
  { label: "How Much Does Padel Cost?", href: "/guides/padel-cost-uk" },
  { label: "What to Wear", href: "/guides/what-to-wear" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-pm-muted hover:text-pm-text transition-colors"
        aria-label="Menu"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[72px] bg-pm-bg border-b border-pm-border shadow-lg z-50">
          <nav className="max-w-[960px] mx-auto px-6 py-4 space-y-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium text-pm-muted hover:text-pm-text transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-3 border-t border-pm-border/40">
              <a href="/demo" className="block py-2.5 text-sm font-medium text-pm-accent">
                See a premium listing →
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
