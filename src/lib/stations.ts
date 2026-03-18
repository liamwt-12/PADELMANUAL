/**
 * London tube/rail station data for /padel/near/[station] pages.
 * Coordinates are approximate centre-of-station values.
 */

export type Station = {
  slug: string
  name: string
  lat: number
  lng: number
}

export const STATIONS: Station[] = [
  // Zone 1 — Central
  { slug: "kings-cross", name: "King's Cross", lat: 51.5308, lng: -0.1238 },
  { slug: "st-pancras", name: "St Pancras", lat: 51.5313, lng: -0.1260 },
  { slug: "euston", name: "Euston", lat: 51.5282, lng: -0.1337 },
  { slug: "london-bridge", name: "London Bridge", lat: 51.5048, lng: -0.0864 },
  { slug: "waterloo", name: "Waterloo", lat: 51.5036, lng: -0.1143 },
  { slug: "victoria", name: "Victoria", lat: 51.4965, lng: -0.1447 },
  { slug: "paddington", name: "Paddington", lat: 51.5154, lng: -0.1755 },
  { slug: "liverpool-street", name: "Liverpool Street", lat: 51.5178, lng: -0.0823 },
  { slug: "cannon-street", name: "Cannon Street", lat: 51.5113, lng: -0.0904 },
  { slug: "blackfriars", name: "Blackfriars", lat: 51.5118, lng: -0.1032 },
  { slug: "city-thameslink", name: "City Thameslink", lat: 51.5141, lng: -0.1037 },
  { slug: "farringdon", name: "Farringdon", lat: 51.5203, lng: -0.1053 },
  { slug: "barbican", name: "Barbican", lat: 51.5204, lng: -0.0979 },
  { slug: "moorgate", name: "Moorgate", lat: 51.5186, lng: -0.0886 },
  { slug: "bank", name: "Bank", lat: 51.5133, lng: -0.0886 },
  { slug: "monument", name: "Monument", lat: 51.5108, lng: -0.0863 },
  { slug: "fenchurch-street", name: "Fenchurch Street", lat: 51.5118, lng: -0.0786 },
  { slug: "charing-cross", name: "Charing Cross", lat: 51.5073, lng: -0.1228 },

  // South West — Clapham, Wandsworth, Putney, Wimbledon
  { slug: "clapham-junction", name: "Clapham Junction", lat: 51.4642, lng: -0.1701 },
  { slug: "brixton", name: "Brixton", lat: 51.4627, lng: -0.1145 },
  { slug: "stockwell", name: "Stockwell", lat: 51.4723, lng: -0.1228 },
  { slug: "clapham-common", name: "Clapham Common", lat: 51.4613, lng: -0.1386 },
  { slug: "clapham-south", name: "Clapham South", lat: 51.4527, lng: -0.1480 },
  { slug: "clapham-high-street", name: "Clapham High Street", lat: 51.4654, lng: -0.1332 },
  { slug: "balham", name: "Balham", lat: 51.4432, lng: -0.1526 },
  { slug: "tooting-bec", name: "Tooting Bec", lat: 51.4355, lng: -0.1594 },
  { slug: "tooting-broadway", name: "Tooting Broadway", lat: 51.4275, lng: -0.1685 },
  { slug: "tooting", name: "Tooting", lat: 51.4200, lng: -0.1680 },
  { slug: "colliers-wood", name: "Colliers Wood", lat: 51.4180, lng: -0.1778 },
  { slug: "south-wimbledon", name: "South Wimbledon", lat: 51.4154, lng: -0.1863 },
  { slug: "wimbledon", name: "Wimbledon", lat: 51.4214, lng: -0.2063 },
  { slug: "wimbledon-park", name: "Wimbledon Park", lat: 51.4343, lng: -0.1992 },
  { slug: "wimbledon-chase", name: "Wimbledon Chase", lat: 51.4090, lng: -0.2135 },
  { slug: "raynes-park", name: "Raynes Park", lat: 51.4048, lng: -0.2267 },
  { slug: "earlsfield", name: "Earlsfield", lat: 51.4431, lng: -0.1868 },
  { slug: "wandsworth-town", name: "Wandsworth Town", lat: 51.4610, lng: -0.1878 },
  { slug: "putney", name: "Putney", lat: 51.4613, lng: -0.2161 },
  { slug: "putney-bridge", name: "Putney Bridge", lat: 51.4682, lng: -0.2089 },
  { slug: "east-putney", name: "East Putney", lat: 51.4591, lng: -0.2112 },
  { slug: "southfields", name: "Southfields", lat: 51.4445, lng: -0.2066 },
  { slug: "morden", name: "Morden", lat: 51.4022, lng: -0.1948 },
  { slug: "mitcham", name: "Mitcham", lat: 51.3930, lng: -0.1673 },
  { slug: "streatham", name: "Streatham", lat: 51.4253, lng: -0.1310 },

  // South West — Fulham, Parsons Green
  { slug: "fulham-broadway", name: "Fulham Broadway", lat: 51.4795, lng: -0.1957 },
  { slug: "parsons-green", name: "Parsons Green", lat: 51.4753, lng: -0.2010 },

  // West — Hammersmith, Shepherds Bush, Notting Hill
  { slug: "hammersmith", name: "Hammersmith", lat: 51.4934, lng: -0.2239 },
  { slug: "shepherds-bush", name: "Shepherd's Bush", lat: 51.5049, lng: -0.2188 },
  { slug: "notting-hill-gate", name: "Notting Hill Gate", lat: 51.5094, lng: -0.1967 },
  { slug: "bayswater", name: "Bayswater", lat: 51.5122, lng: -0.1879 },
  { slug: "queens-park", name: "Queen's Park", lat: 51.5341, lng: -0.2047 },

  // North West — Kilburn, West Hampstead, Finchley Road
  { slug: "kilburn", name: "Kilburn", lat: 51.5472, lng: -0.2042 },
  { slug: "west-hampstead", name: "West Hampstead", lat: 51.5469, lng: -0.1909 },
  { slug: "finchley-road", name: "Finchley Road", lat: 51.5472, lng: -0.1803 },

  // North — Camden, Hampstead, Highgate, Kentish Town
  { slug: "camden-town", name: "Camden Town", lat: 51.5392, lng: -0.1426 },
  { slug: "chalk-farm", name: "Chalk Farm", lat: 51.5441, lng: -0.1538 },
  { slug: "belsize-park", name: "Belsize Park", lat: 51.5504, lng: -0.1642 },
  { slug: "hampstead", name: "Hampstead", lat: 51.5568, lng: -0.1782 },
  { slug: "highgate", name: "Highgate", lat: 51.5776, lng: -0.1462 },
  { slug: "archway", name: "Archway", lat: 51.5653, lng: -0.1353 },
  { slug: "tufnell-park", name: "Tufnell Park", lat: 51.5567, lng: -0.1380 },
  { slug: "kentish-town", name: "Kentish Town", lat: 51.5507, lng: -0.1402 },

  // North East — Islington, Angel, Old Street, Shoreditch
  { slug: "angel", name: "Angel", lat: 51.5322, lng: -0.1058 },
  { slug: "old-street", name: "Old Street", lat: 51.5263, lng: -0.0878 },
  { slug: "shoreditch-high-street", name: "Shoreditch High Street", lat: 51.5224, lng: -0.0746 },

  // East — Bethnal Green, Mile End, Bow, Stratford
  { slug: "bethnal-green", name: "Bethnal Green", lat: 51.5275, lng: -0.0548 },
  { slug: "mile-end", name: "Mile End", lat: 51.5252, lng: -0.0332 },
  { slug: "bow-road", name: "Bow Road", lat: 51.5269, lng: -0.0247 },
  { slug: "bromley-by-bow", name: "Bromley-by-Bow", lat: 51.5248, lng: -0.0119 },
  { slug: "stratford", name: "Stratford", lat: 51.5416, lng: -0.0040 },
  { slug: "west-ham", name: "West Ham", lat: 51.5287, lng: 0.0056 },
  { slug: "plaistow", name: "Plaistow", lat: 51.5313, lng: 0.0172 },
  { slug: "upton-park", name: "Upton Park", lat: 51.5354, lng: 0.0335 },
  { slug: "east-ham", name: "East Ham", lat: 51.5394, lng: 0.0518 },
  { slug: "barking", name: "Barking", lat: 51.5396, lng: 0.0809 },
  { slug: "ilford", name: "Ilford", lat: 51.5590, lng: 0.0700 },
  { slug: "seven-kings", name: "Seven Kings", lat: 51.5644, lng: 0.0965 },
  { slug: "goodmayes", name: "Goodmayes", lat: 51.5660, lng: 0.1097 },
  { slug: "chadwell-heath", name: "Chadwell Heath", lat: 51.5682, lng: 0.1290 },
  { slug: "romford", name: "Romford", lat: 51.5751, lng: 0.1825 },
  { slug: "gidea-park", name: "Gidea Park", lat: 51.5822, lng: 0.2055 },
  { slug: "harold-wood", name: "Harold Wood", lat: 51.5927, lng: 0.2330 },
  { slug: "brentwood", name: "Brentwood", lat: 51.6132, lng: 0.2990 },

  // South East — Greenwich, Lewisham, Catford, Crystal Palace
  { slug: "canary-wharf", name: "Canary Wharf", lat: 51.5051, lng: -0.0209 },
  { slug: "greenwich", name: "Greenwich", lat: 51.4781, lng: -0.0147 },
  { slug: "deptford", name: "Deptford", lat: 51.4742, lng: -0.0260 },
  { slug: "lewisham", name: "Lewisham", lat: 51.4652, lng: -0.0136 },
  { slug: "catford", name: "Catford", lat: 51.4445, lng: -0.0205 },
  { slug: "crystal-palace", name: "Crystal Palace", lat: 51.4181, lng: -0.0726 },
  { slug: "forest-hill", name: "Forest Hill", lat: 51.4393, lng: -0.0530 },
  { slug: "sydenham", name: "Sydenham", lat: 51.4273, lng: -0.0543 },
  { slug: "penge-east", name: "Penge East", lat: 51.4192, lng: -0.0548 },
  { slug: "anerley", name: "Anerley", lat: 51.4127, lng: -0.0656 },
  { slug: "norwood-junction", name: "Norwood Junction", lat: 51.3970, lng: -0.0750 },

  // South West — Richmond, Kingston, Surbiton
  { slug: "richmond", name: "Richmond", lat: 51.4633, lng: -0.3015 },
  { slug: "new-malden", name: "New Malden", lat: 51.4034, lng: -0.2566 },
  { slug: "norbiton", name: "Norbiton", lat: 51.4121, lng: -0.2847 },
  { slug: "kingston", name: "Kingston", lat: 51.4117, lng: -0.2999 },
  { slug: "surbiton", name: "Surbiton", lat: 51.3934, lng: -0.3042 },
]

// Quick lookup by slug
export const STATION_MAP: Record<string, Station> = {}
for (const s of STATIONS) {
  STATION_MAP[s.slug] = s
}

/**
 * Haversine distance in miles between two lat/lng points.
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 3959 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Find nearby stations within a given radius.
 */
export function nearbyStations(slug: string, radiusMiles = 3): Station[] {
  const origin = STATION_MAP[slug]
  if (!origin) return []
  return STATIONS
    .filter(s => s.slug !== slug)
    .map(s => ({ ...s, dist: haversineDistance(origin.lat, origin.lng, s.lat, s.lng) }))
    .filter(s => s.dist <= radiusMiles)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5)
}

/**
 * Find the nearest station to a given lat/lng. Returns null if no station within 5 miles.
 */
export function nearestStation(lat: number, lng: number): Station | null {
  let best: Station | null = null
  let bestDist = Infinity
  for (const s of STATIONS) {
    const d = haversineDistance(lat, lng, s.lat, s.lng)
    if (d < bestDist) {
      bestDist = d
      best = s
    }
  }
  return bestDist <= 5 ? best : null
}
