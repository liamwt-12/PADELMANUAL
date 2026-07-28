import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * RETIRED — daily owner notification checks are switched off.
 *
 * This cron re-raised a `review_unanswered` notification for the same seeded demo
 * reviews every single day with no dedupe, writing 512 junk rows (~3.5/day and
 * growing without bound). Its entire audience was the founder plus two demo
 * accounts, so it produced noise and nothing else.
 *
 * Removed from vercel.json and stubbed here. Original implementation is in git
 * history; it needs dedupe before it is ever re-enabled.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Gone — notification checks are disabled.' },
    { status: 410 },
  )
}
