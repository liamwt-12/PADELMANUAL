import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Operating hours assumption: 7am–10pm = 15 hours of bookable time
const HOURS_PER_DAY = 15
const SLOT_DURATION_MINS = 90

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenant_id')
  const courtsParam = request.nextUrl.searchParams.get('courts')

  if (!tenantId) {
    return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 })
  }

  const totalCourts = parseInt(courtsParam || '1') || 1
  // Total bookable slots per day = (hours * 60 / slot_duration) * courts
  const slotsPerDay = Math.floor((HOURS_PER_DAY * 60) / SLOT_DURATION_MINS) * totalCourts

  try {
    const days: { day: string; label: string; totalSlots: number; bookedSlots: number; pct: number }[] = []

    // Fetch availability for next 7 days
    const now = new Date()
    const fetches: Promise<Response>[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() + i * 86400000)
      const dateStr = date.toISOString().split('T')[0]
      const url = `https://api.playtomic.io/v1/availability?sport_id=PADEL&tenant_id=${tenantId}&start_min=${dateStr}T07:00:00&start_max=${dateStr}T22:00:00`
      fetches.push(fetch(url, { headers: { 'User-Agent': 'PadelManual/1.0' } }))
    }

    const responses = await Promise.all(fetches)

    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() + i * 86400000)
      const dateStr = date.toISOString().split('T')[0]
      const label = i === 0 ? 'Today' : DAY_LABELS[date.getDay()]

      let availableSlots = 0
      try {
        const data = await responses[i].json()
        if (Array.isArray(data)) {
          for (const resource of data) {
            if (Array.isArray(resource.slots)) {
              availableSlots += resource.slots.length
            }
          }
        }
      } catch {
        // If one day fails, skip it
      }

      // Booked = total capacity minus available
      const bookedSlots = Math.max(0, slotsPerDay - availableSlots)
      const pct = slotsPerDay > 0 ? Math.round((bookedSlots / slotsPerDay) * 100) : 0

      days.push({
        day: dateStr,
        label,
        totalSlots: slotsPerDay,
        bookedSlots,
        pct: Math.min(pct, 100),
      })
    }

    return NextResponse.json(
      { days },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch {
    return NextResponse.json({ days: [], error: 'Failed to fetch utilisation' }, { status: 500 })
  }
}
