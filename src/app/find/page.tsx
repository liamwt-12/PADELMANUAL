// src/app/find/page.tsx
// PADEL MANUAL — Court Finder Page
// Leaflet map + sidebar list + filters
// Wired to Supabase listings table

import { createClient } from '@supabase/supabase-js';
import FindPageClient from './FindPageClient';

export const metadata = {
  title: 'Find Padel Courts | Padel Manual',
  description: 'Find every padel court in the UK. Search 500+ venues by city, indoor/outdoor, and more.',
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function FindPage() {
  // Fetch all listings server-side for initial render + SEO
  const { data: listings } = await supabase
    .from('listings')
    .select('id, name, slug, lat, lng, city, region, courts, indoor, booking_platform, playtomic_url, listing_type, claimed, premium, postcode, address')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('name');

  // Get unique cities for filter
  const cities = [...new Set((listings || []).map(l => l.city).filter(Boolean))].sort();

  return <FindPageClient listings={listings || []} cities={cities} />;
}
