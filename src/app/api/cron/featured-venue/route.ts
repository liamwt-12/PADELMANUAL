import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * RETIRED — automated venue outreach is permanently switched off.
 *
 * Padel Manual is mothballed. This endpoint used to send unsolicited email to
 * scraped venue contact addresses. It is disabled at three layers:
 *   1. removed from vercel.json crons
 *   2. this handler, which no longer contains any sending logic
 *   3. the admin dashboard trigger UI has been removed
 *
 * The original implementation is in git history. Do not re-enable without a
 * lawful basis for direct marketing and a working opt-out path.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Gone — automated outreach is permanently disabled.' },
    { status: 410 },
  )
}

export async function POST() {
  return NextResponse.json(
    { error: 'Gone — automated outreach is permanently disabled.' },
    { status: 410 },
  )
}
