import "./globals.css";
import type { Metadata } from "next";
import MobileNav from "./MobileNav";

export const metadata: Metadata = {
  title: {
    default: "Padel Manual — The modern guide to UK padel",
    template: "%s | Padel Manual",
  },
  description:
    "Courts, coaches, gear, and leagues for UK padel players. Curated, not cluttered.",
  metadataBase: new URL("https://padelmanual.com"),
  openGraph: { siteName: "Padel Manual", type: "website", locale: "en_GB" },
};

const navLinks = [
  { label: "Find Courts", href: "/find" },
  { label: "London", href: "/london" },
  { label: "Gear", href: "/gear" },
  { label: "Weekly", href: "/weekly" },
];

function Nav() {
  return (
    <header className="flex items-center justify-between py-8">
      <a href="/" className="flex items-baseline gap-1.5">
        <span className="font-serif text-xl font-bold tracking-tight text-pm-text">Padel</span>
        <span className="text-[11px] tracking-[0.12em] uppercase text-pm-faint">Manual</span>
      </a>
      {/* Desktop nav */}
      <nav className="hidden sm:flex gap-7 items-center">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[13px] font-medium text-pm-muted hover:text-pm-text transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>
      {/* Mobile nav */}
      <MobileNav links={navLinks} />
    </header>
  );
}

function Footer() {
  return (
    <footer className="py-12 mt-16 border-t border-pm-border/40">
      <div className="flex justify-between items-start flex-wrap gap-8">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-base font-bold text-pm-text">Padel</span>
            <span className="text-[10px] tracking-[0.12em] uppercase text-pm-faint">Manual</span>
          </div>
          <p className="text-xs text-pm-faint mt-2 max-w-[280px] leading-relaxed">
            Independent. Curated. For players, not algorithms.
          </p>
        </div>
        <div className="flex gap-10">
          <div>
            <div className="label-caps mb-3">Explore</div>
            {[
              { label: "Find Courts", href: "/find" },
              { label: "London", href: "/london" },
              { label: "Gear", href: "/gear" },
            ].map((l) => (
              <a key={l.href} href={l.href} className="block text-[13px] text-pm-muted mb-2 hover:text-pm-text transition-colors">{l.label}</a>
            ))}
          </div>
          <div>
            <div className="label-caps mb-3">More</div>
            <a href="/weekly" className="block text-[13px] text-pm-muted mb-2 hover:text-pm-text transition-colors">Weekly Note</a>
          </div>
        </div>
      </div>
      <div className="text-[11px] text-pm-ash mt-10">
        © {new Date().getFullYear()} Padel Manual. All rights reserved.
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pm-bg text-pm-text antialiased">
        <div className="mx-auto max-w-[960px] px-6">
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
