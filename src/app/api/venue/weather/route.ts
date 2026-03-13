import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type WeatherDay = {
  date: string
  dayName: string
  temp: number
  precipitation: number
  weatherCode: number
  emoji: string
  condition: string
}

function weatherEmoji(code: number): string {
  if (code <= 1) return '☀️'
  if (code <= 3) return '🌤'
  if (code <= 48) return '☁️'
  if (code <= 57) return '🌦'
  if (code <= 67) return '🌧'
  if (code <= 77) return '🌨'
  if (code <= 82) return '🌧'
  return '⛈'
}

function weatherCondition(code: number): string {
  if (code <= 1) return 'Clear'
  if (code <= 3) return 'Cloudy'
  if (code <= 48) return 'Overcast'
  if (code <= 57) return 'Drizzle'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Rain showers'
  return 'Thunderstorm'
}

function weekendAdvice(sat: WeatherDay | null, sun: WeatherDay | null): string {
  const days = [sat, sun].filter(Boolean) as WeatherDay[]
  if (days.length === 0) return ''

  const maxPrecip = Math.max(...days.map(d => d.precipitation))
  const maxCode = Math.max(...days.map(d => d.weatherCode))

  if (maxCode <= 1) return 'Good conditions for padel.'
  if (maxCode <= 3 && maxPrecip < 0.5) return 'Overcast but playable.'
  if (maxPrecip > 0 && maxPrecip <= 2) return 'Light rain forecast. Indoor courts recommended.'
  if (maxPrecip > 2) return 'Heavy rain expected. A good weekend to promote indoor bookings.'
  return 'Overcast but playable.'
}

export async function GET() {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await authClient.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: owner } = await supabase
    .from('venue_owners')
    .select('listing_id')
    .eq('email', user.email)
    .single()

  if (!owner?.listing_id) {
    return NextResponse.json({ error: 'No listing' }, { status: 404 })
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('lat, lng, city')
    .eq('id', owner.listing_id)
    .single()

  if (!listing?.lat || !listing?.lng) {
    return NextResponse.json({ days: null })
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${listing.lat}&longitude=${listing.lng}&daily=weathercode,temperature_2m_max,precipitation_sum&timezone=Europe/London&forecast_days=7`
    const res = await fetch(url)
    const data = await res.json()

    if (!data.daily?.time) {
      return NextResponse.json({ days: null })
    }

    const allDays: WeatherDay[] = data.daily.time.map((date: string, i: number) => {
      const d = new Date(date + 'T12:00:00')
      const code = data.daily.weathercode[i]
      return {
        date,
        dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        dayOfWeek: d.getDay(),
        temp: Math.round(data.daily.temperature_2m_max[i]),
        precipitation: data.daily.precipitation_sum[i],
        weatherCode: code,
        emoji: weatherEmoji(code),
        condition: weatherCondition(code),
      }
    })

    // Find Saturday (6) and Sunday (0)
    const saturday = allDays.find(d => new Date(d.date + 'T12:00:00').getDay() === 6) || null
    const sunday = allDays.find(d => new Date(d.date + 'T12:00:00').getDay() === 0) || null

    const weekendDays = [saturday, sunday].filter(Boolean) as WeatherDay[]

    if (weekendDays.length === 0) {
      return NextResponse.json({ days: null })
    }

    return NextResponse.json({
      days: weekendDays,
      advice: weekendAdvice(saturday, sunday),
      city: listing.city,
    })
  } catch {
    return NextResponse.json({ days: null })
  }
}
