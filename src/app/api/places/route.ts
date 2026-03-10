import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  const placeId = request.nextUrl.searchParams.get('place_id');
  
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    let id = placeId;

    // Step 1: If no place_id, search for the venue
    if (!id && query) {
      const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName',
        },
        body: JSON.stringify({
          textQuery: query + ' padel',
          languageCode: 'en',
          maxResultCount: 1,
        }),
      });
      const searchData = await searchRes.json();
      if (searchData.places?.[0]?.id) {
        id = searchData.places[0].id;
      }
    }

    if (!id) {
      return NextResponse.json({ photos: [], rating: null, reviewCount: 0, reviews: [] });
    }

    // Step 2: Get place details with photos and reviews
    const detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${id}?languageCode=en`,
      {
        headers: {
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews,photos,googleMapsUri,websiteUri,currentOpeningHours,formattedAddress',
        },
      }
    );
    const details = await detailsRes.json();

    // Step 3: Build photo URLs
    const photos = (details.photos || []).slice(0, 6).map((photo: any) => {
      const name = photo.name; // e.g. "places/ChIJ.../photos/AUG..."
      return {
        url: `https://places.googleapis.com/v1/${name}/media?maxWidthPx=800&key=${API_KEY}`,
        attributions: photo.authorAttributions || [],
      };
    });

    // Step 4: Extract reviews
    const reviews = (details.reviews || []).slice(0, 5).map((r: any) => ({
      author: r.authorAttribution?.displayName || 'Anonymous',
      rating: r.rating || 0,
      text: r.text?.text || '',
      time: r.relativePublishTimeDescription || '',
      profilePhoto: r.authorAttribution?.photoUri || null,
    }));

    return NextResponse.json(
      {
        placeId: id,
        photos,
        rating: details.rating || null,
        reviewCount: details.userRatingCount || 0,
        reviews,
        googleMapsUrl: details.googleMapsUri || null,
        address: details.formattedAddress || null,
        openNow: details.currentOpeningHours?.openNow ?? null,
        hours: details.currentOpeningHours?.weekdayDescriptions || [],
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (err) {
    console.error('Google Places error:', err);
    return NextResponse.json({ photos: [], rating: null, reviewCount: 0, reviews: [] }, { status: 500 });
  }
}
