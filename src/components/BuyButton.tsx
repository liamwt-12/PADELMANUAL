'use client'

export default function BuyButton({
  affiliateUrl,
  productId,
  productSlug,
  label = "Buy from Express Padel",
  variant = "primary",
  retailer = "express_padel",
}: {
  affiliateUrl: string
  productId: string
  productSlug: string
  label?: string
  variant?: "primary" | "secondary"
  retailer?: string
}) {
  function handleClick() {
    try {
      navigator.sendBeacon(
        '/api/gear/track-click',
        JSON.stringify({ product_id: productId, product_slug: productSlug, retailer }),
      )
    } catch {
      // silent fail
    }
  }

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-opacity hover:opacity-90 ${
        variant === "primary"
          ? "bg-pm-accent text-white"
          : "border border-pm-border text-pm-text bg-white"
      }`}
    >
      {label}
      <span aria-hidden="true">&rarr;</span>
    </a>
  )
}
