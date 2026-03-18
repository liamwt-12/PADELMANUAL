import type { Metadata } from 'next'
import { getTopCities } from '@/lib/db'
import PlayTodayClient from './PlayTodayClient'

export const metadata: Metadata = {
  title: 'Play Today — Find Available Padel Courts Now',
  description: 'Find padel courts with slots available right now. Live availability from Playtomic across hundreds of UK venues.',
}

export default async function PlayTodayPage() {
  const topCities = await getTopCities(20)
  const cities = topCities.map(c => c.city)

  return <PlayTodayClient cities={cities} />
}
