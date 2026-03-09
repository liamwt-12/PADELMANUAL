import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenant_id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 });
  }

  // Get today and tomorrow in ISO format
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];

  // Current hour for filtering past slots
  const currentHour = now.getUTCHours();

  try {
    // Fetch today's remaining slots
    const todayUrl = `https://api.playtomic.io/v1/availability?sport_id=PADEL&tenant_id=${tenantId}&start_min=${today}T${String(currentHour).padStart(2, '0')}:00:00&start_max=${today}T23:59:59`;
    const tomorrowUrl = `https://api.playtomic.io/v1/availability?sport_id=PADEL&tenant_id=${tenantId}&start_min=${tomorrow}T00:00:00&start_max=${tomorrow}T23:59:59`;

    const [todayRes, tomorrowRes] = await Promise.all([
      fetch(todayUrl, { headers: { 'User-Agent': 'PadelManual/1.0' } }),
      fetch(tomorrowUrl, { headers: { 'User-Agent': 'PadelManual/1.0' } }),
    ]);

    const todayData = await todayRes.json();
    const tomorrowData = await tomorrowRes.json();

    // Flatten slots across all courts
    interface Slot {
      start_time: string;
      duration: number;
      price: string;
    }
    
    interface Resource {
      resource_id: string;
      start_date: string;
      slots: Slot[];
    }

    const todaySlots: { time: string; price: string; duration: number; courts: number; day: string }[] = [];
    const tomorrowSlots: { time: string; price: string; duration: number; courts: number; day: string }[] = [];

    // Count available courts per time slot for today
    const todayByTime: Record<string, { price: string; duration: number; count: number }> = {};
    if (Array.isArray(todayData)) {
      for (const resource of todayData as Resource[]) {
        for (const slot of resource.slots) {
          const key = slot.start_time;
          if (!todayByTime[key]) {
            todayByTime[key] = { price: slot.price, duration: slot.duration, count: 0 };
          }
          todayByTime[key].count++;
        }
      }
    }
    for (const [time, info] of Object.entries(todayByTime)) {
      todaySlots.push({ time, price: info.price, duration: info.duration, courts: info.count, day: 'Today' });
    }
    todaySlots.sort((a, b) => a.time.localeCompare(b.time));

    // Same for tomorrow
    const tomorrowByTime: Record<string, { price: string; duration: number; count: number }> = {};
    if (Array.isArray(tomorrowData)) {
      for (const resource of tomorrowData as Resource[]) {
        for (const slot of resource.slots) {
          const key = slot.start_time;
          if (!tomorrowByTime[key]) {
            tomorrowByTime[key] = { price: slot.price, duration: slot.duration, count: 0 };
          }
          tomorrowByTime[key].count++;
        }
      }
    }
    for (const [time, info] of Object.entries(tomorrowByTime)) {
      tomorrowSlots.push({ time, price: info.price, duration: info.duration, courts: info.count, day: 'Tomorrow' });
    }
    tomorrowSlots.sort((a, b) => a.time.localeCompare(b.time));

    // Return top slots
    const allSlots = [...todaySlots.slice(0, 4), ...tomorrowSlots.slice(0, 4)];

    return NextResponse.json(
      { slots: allSlots, updated: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ slots: [], error: 'Failed to fetch availability' }, { status: 500 });
  }
}
