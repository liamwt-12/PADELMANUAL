import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Padel Manual — The modern guide to UK padel",
    template: "%s | Padel Manual",
  },
  description:
    "Play better. Find better. Buy better. Curated courts, coaches, leagues, and gear for UK padel players.",
  metadataBase: new URL("https://padelmanual.com"),
  openGraph: {
    siteName: "Padel Manual",
    type: "website",
    locale: "en_GB",
  },
};

function Nav() {
  return (
    <header className="flex items-center justify-between py-8">
      <a href="/" className="flex items-baseline gap-1.5">
        <span className="font-display text-xl font-bold tracking-tight text-brand-black">
          Padel
        </span>
        <span className="font-body text-[13px] tracking-[0.12em] uppercase text-brand-pewter">
          Manual
        </span>
      </a>
      <nav className="flex gap-7 items-center">
        {[
          { label: "London", href: "/london" },
          { label: "Gear", href: "/gear" },
          { label: "Partner", href: "/partner" },
          { label: "Weekly Note", href: "/weekly" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-body text-[13px] font-medium text-brand-muted hover:text-brand-black transition-colors tracking-wide"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="py-12 mt-16">
      <div className="border-t border-brand-ash pt-8">
        <div className="flex justify-between items-start flex-wrap gap-8">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-base font-bold text-brand-black">
                Padel
              </span>
              <span className="font-body text-[11px] tracking-[0.12em] uppercase text-brand-pewter">
                Manual
              </span>
            </div>
            <p className="font-body text-xs text-brand-pewter mt-2 max-w-[280px] leading-relaxed">
              Independent & curated. We feature partners, but we don&apos;t
              publish junk.
            </p>
          </div>
          <div className="flex gap-10">
            <div>
              <div className="font-body text-[10px] font-semibold tracking-[0.14em] uppercase text-brand-pewter mb-3">
                Explore
              </div>
              {["London", "Coaches", "Courts", "Leagues", "Gear"].map((l) => (
                <div
                  key={l}
                  className="font-body text-[13px] text-brand-muted mb-2"
                >
                  <a href={l === "Gear" ? "/gear" : `/london/${l.toLowerCase()}`} className="hover:text-brand-black transition-colors">
                    {l}
                  </a>
                </div>
              ))}
            </div>
            <div>
              <div className="font-body text-[10px] font-semibold tracking-[0.14em] uppercase text-brand-pewter mb-3">
                Company
              </div>
              {[
                { label: "Partner", href: "/partner" },
                { label: "Weekly Note", href: "/weekly" },
              ].map((l) => (
                <div
                  key={l.href}
                  className="font-body text-[13px] text-brand-muted mb-2"
                >
                  <a href={l.href} className="hover:text-brand-black transition-colors">
                    {l.label}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="font-body text-[11px] text-brand-ash mt-10">
          © {new Date().getFullYear()} Padel Manual. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-[960px] px-6">
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
