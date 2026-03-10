import type { Metadata } from "next";
import "./globals.css";
import MobileNav from "./MobileNav";

export const metadata: Metadata = {
  title: { default: "Padel Manual — The Modern Guide to UK Padel", template: "%s | Padel Manual" },
  description: "Find padel courts, read gear reviews, and book with live availability. The UK's most comprehensive padel directory.",
  metadataBase: new URL("https://www.padelmanual.com"),
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://www.padelmanual.com",
    siteName: "Padel Manual",
    title: "Padel Manual — The Modern Guide to UK Padel",
    description: "Find padel courts, read gear reviews, and book with live availability.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Padel Manual — The Modern Guide to UK Padel",
    description: "Find padel courts, read gear reviews, and book with live availability.",
  },
  alternates: {
    canonical: "https://www.padelmanual.com",
  },
};

const navLinks = [
  { label: "Find Courts", href: "/find" },
  { label: "Gear", href: "/gear" },
  { label: "Shop", href: "/gear/shop" },
  { label: "Quiz", href: "/quiz" },
  { label: "Guides", href: "/guides/padel-vs-tennis" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-[960px] px-6">
          <header className="flex items-center justify-between py-5">
            <a href="/" className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl font-bold tracking-tight text-pm-text">Padel</span>
              <span className="text-[11px] tracking-[0.12em] uppercase text-pm-faint">Manual</span>
            </a>
            <nav className="hidden sm:flex gap-6 items-center">
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
            <MobileNav />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
