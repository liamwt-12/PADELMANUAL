import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Play Today — live availability is switched off.
 *
 * This route used to query api.playtomic.io for real-time court slots. Playtomic
 * now blocks the request (HTTP 403, CloudFront "Request blocked"), and the old
 * implementation swallowed that error and returned an empty slot list — so every
 * venue rendered as "no availability", which the page presented to users as fact.
 *
 * Rather than assert something false, the endpoint now says plainly that the
 * feature is unavailable. The original implementation is in git history. Do not
 * re-enable without a supported data source; see docs/portfolio-audit.md.
 */
export async function GET() {
  return NextResponse.json(
    {
      unavailable: true,
      reason: 'upstream_unavailable',
      message:
        'Live court availability is currently unavailable. Padel Manual can no longer read availability from Playtomic, so we cannot tell you which courts are free.',
      venues: [],
    },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
