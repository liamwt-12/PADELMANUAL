import { createClient } from '@supabase/supabase-js';
import FindPageClient from './FindPageClient';

export const metadata = {
  title: 'Find Padel Courts Near You',
  description: 'Search 500+ padel venues across the UK. Filter by city, indoor/outdoor, and find courts near you.',
};

export const revalidate = 3600; // refresh data hourly

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function FindPage() {
  const { data: listings } = await supabase
    .from('listings')
    .select('id, name, slug, lat, lng, city, region, courts, indoor, booking_platform, playtomic_url, listing_type, claimed, premium, postcode, address')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('name');

  const cities = [...new Set((listings || []).map(l => l.city).filter(Boolean))].sort();

  return <FindPageClient listings={listings || []} cities={cities} />;
}
