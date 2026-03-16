export type ListingType = "court" | "coach" | "league";
export type ListingTier = "standard" | "featured";

export type Listing = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  region: string | null;
  
  // New schema fields
  listing_type?: string;
  lat?: number | null;
  lng?: number | null;
  courts?: number | null;
  indoor?: boolean | null;
  postcode?: string | null;
  address?: string | null;
  booking_platform?: string | null;
  playtomic_url?: string | null;
  playtomic_slug?: string | null;
  playtomic_tenant_id?: string | null;
  source?: string | null;
  claimed?: boolean;
  premium?: boolean;
  view_count?: number;
  click_count?: number;
  last_viewed_at?: string | null;
  images?: string[] | null;
  opening_hours_text?: string | null;
  phone?: string | null;
  email?: string | null;
  youtube_video_url?: string | null;
  announcement?: string | null;
  permanently_closed?: boolean;
  closed_at?: string | null;
  manually_outreached_at?: string | null;

  // Google Reviews
  google_place_id?: string | null;
  google_rating?: number | null;
  google_review_count?: number | null;
  google_data_updated_at?: string | null;

  // Playtomic public data
  playtomic_rating?: number | null;
  playtomic_review_count?: number | null;
  playtomic_data_updated_at?: string | null;

  // WhatsApp
  whatsapp_number?: string | null;

  // Pricing
  price_per_hour_peak?: number | null;
  price_per_hour_offpeak?: number | null;

  // Old schema fields (still used by London pages)
  type?: ListingType;
  area?: string | null;
  short_blurb?: string | null;
  description?: string | null;
  website_url?: string | null;
  booking_url?: string | null;
  instagram_url?: string | null;
  contact_email?: string | null;
  price_from?: string | null;
  courts_count?: number | null;
  tier?: ListingTier;
  featured?: boolean;
  status?: string;
  hero_image_url?: string | null;
  tags?: string[] | null;
  paid_until?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type GearProduct = {
  name: string;
  brand: string;
  price: string;
  url: string;        // generic URL (replaces amazonUrl)
  amazonUrl?: string;  // keep for backwards compat
  verdict: string;
  bestFor: string;
};

export type GearItem = {
  slug: string;
  title: string;
  category: "rackets" | "shoes" | "balls" | "bags";
  headline: string;
  intro: string;
  products: GearProduct[];
};
