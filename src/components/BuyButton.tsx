'use client'

export default function BuyButton({
  affiliateUrl,
  productId,
  productSlug,
}: {
  affiliateUrl: string
  productId: string
  productSlug: string
}) {
  function handleClick() {
    try {
      navigator.sendBeacon(
        '/api/gear/track-click',
        JSON.stringify({ product_id: productId, product_slug: productSlug }),
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
      className="inline-flex items-center gap-2 rounded-full bg-pm-accent text-white px-7 py-3.5 text-sm font-medium transition-opacity hover:opacity-90"
    >
      Buy from Express Padel
      <span aria-hidden="true">&rarr;</span>
    </a>
  )
}
