export default function FindLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-pm-bg flex flex-col">
      {/* Compact nav */}
      <header className="flex items-center justify-between py-3 px-4 sm:px-6 border-b border-pm-border/60 shrink-0">
        <a href="/" className="flex items-baseline gap-1.5 shrink-0">
          <span className="font-serif text-lg font-bold tracking-tight text-pm-text">Padel</span>
          <span className="text-[10px] tracking-[0.12em] uppercase text-pm-faint">Manual</span>
        </a>
        <nav className="flex gap-4 sm:gap-6 items-center">
          {[
            { label: "Find Courts", href: "/find" },
            { label: "Gear", href: "/gear" },
            { label: "Quiz", href: "/quiz" },
            { label: "Weekly", href: "/weekly" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-pm-muted hover:text-pm-text transition-colors whitespace-nowrap hidden sm:inline"
            >
              {link.label}
            </a>
          ))}
          <a href="/" className="sm:hidden text-[13px] font-medium text-pm-muted">Home</a>
        </nav>
      </header>
      {children}
    </div>
  );
}
