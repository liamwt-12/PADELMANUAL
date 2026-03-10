interface Props {
  name: string;
  city: string | null;
  postcode: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  courts: number | null;
  indoor: boolean | null;
  website: string | null;
  slug: string;
}

export default function ListingSchema({ name, city, postcode, address, lat, lng, courts, indoor, website, slug }: Props) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name,
    url: `https://www.padelmanual.com/${slug}`,
    sport: 'Padel',
  };

  if (address || city) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: city || undefined,
      postalCode: postcode || undefined,
      streetAddress: address || undefined,
      addressCountry: 'GB',
    };
  }

  if (lat && lng) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng,
    };
  }

  if (website) schema.sameAs = website;
  if (courts) schema.numberOfRooms = courts;
  if (indoor !== null) {
    schema.amenityFeature = {
      '@type': 'LocationFeatureSpecification',
      name: indoor ? 'Indoor courts' : 'Outdoor courts',
      value: true,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
