export default function FindLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="find-layout">
      {/* Nav — same as main but full-width with inner container */}
      <header className="flex items-center justify-between py-4 px-4 sm:px-6 max-w-screen-2xl mx-auto">
        <a href="/" className="flex items-baseline gap-1.5 shrink-0">
          <span className="font-serif text-xl font-bold tracking-tight text-pm-text">Padel</span>
          <span className="text-[11px] tracking-[0.12em] uppercase text-pm-faint">Manual</span>
        </a>
        <nav className="flex gap-4 sm:gap-7 items-center overflow-x-auto">
          {[
            { label: "Find Courts", href: "/find" },
            { label: "London", href: "/london" },
            { label: "Gear", href: "/gear" },
            { label: "Weekly", href: "/weekly" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-pm-muted hover:text-pm-text transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
