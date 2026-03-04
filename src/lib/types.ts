export type ListingType = "court" | "coach" | "league";
export type ListingTier = "standard" | "featured";

export type Listing = {
  id: string;
  type: ListingType;
  city: string;
  name: string;
  area: string | null;
  slug: string;
  short_blurb: string | null;
  description: string | null;
  website_url: string | null;
  booking_url: string | null;
  instagram_url: string | null;
  contact_email: string | null;
  price_from: string | null;
  courts_count: number | null;
  indoor: boolean | null;
  tier: ListingTier;
  featured: boolean;
  status: string;
  hero_image_url: string | null;
  tags: string[] | null;
  paid_until: string | null;
  created_at: string;
  updated_at: string;
};

export type GearProduct = {
  name: string;
  brand: string;
  price: string;
  amazonUrl: string;
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
