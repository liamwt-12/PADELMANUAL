interface Props {
  city?: string;
  className?: string;
}

export default function PlayTodayBanner({ city, className = '' }: Props) {
  const href = city ? `/play-today/${city.toLowerCase()}` : '/play-today';
  return (
    <aside
      className={`relative overflow-hidden rounded-3xl bg-pm-accent p-8 md:p-10 ${className}`}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            Live availability
          </div>
          <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl">
            {city
              ? `Find a padel court in ${city} available right now.`
              : 'Find a padel court available right now.'}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
            Real-time slots from Playtomic across hundreds of UK venues. Book in under a minute.
          </p>
        </div>
        <a
          href={href}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-white px-7 py-4 text-sm font-semibold text-pm-accent shadow-md transition-transform hover:scale-[1.02] md:self-auto"
        >
          Find courts available now
          <span aria-hidden>→</span>
        </a>
      </div>
    </aside>
  );
}
