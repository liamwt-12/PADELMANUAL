const RETAILERS = [
  { key: '', label: 'All' },
  { key: 'express_padel', label: 'Express Padel' },
  { key: 'decathlon', label: 'Decathlon' },
];

export default function RetailerFilter({
  currentRetailer,
  basePath,
}: {
  currentRetailer?: string;
  basePath: string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
      {RETAILERS.map(r => {
        const active = (r.key === '' && !currentRetailer) || r.key === currentRetailer;
        const href = r.key ? `${basePath}?retailer=${r.key}` : basePath;
        return (
          <a
            key={r.key}
            href={href}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              active
                ? 'bg-pm-text text-white'
                : 'border border-pm-border/60 text-pm-muted hover:bg-pm-bg-hover hover:text-pm-text'
            }`}
          >
            {r.label}
          </a>
        );
      })}
    </div>
  );
}
