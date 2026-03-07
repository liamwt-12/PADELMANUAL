import { supabase } from "./supabase";
import type { Listing, ListingType } from "./types";

/* ── National queries (new 528+ venue data) ── */

export async function getVenueCount() {
  const { count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("listing_type", "venue");
  if (error) return 0;
  return count ?? 0;
}

export async function getCoachCount() {
  const { count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("listing_type", "coach");
  if (error) return 0;
  return count ?? 0;
}

export async function getCourtTotal() {
  const { data, error } = await supabase
    .from("listings")
    .select("courts")
    .not("courts", "is", null);
  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + (row.courts || 0), 0);
}

export async function getVenuesByCity(city: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("city", city)
    .order("name");
  if (error) return [];
  return (data ?? []) as Listing[];
}

export async function getTopCities(limit = 10) {
  const { data, error } = await supabase
    .from("listings")
    .select("city")
    .not("city", "is", null)
    .eq("listing_type", "venue");
  if (error || !data) return [];
  
  const counts: Record<string, number> = {};
  data.forEach(row => {
    if (row.city) counts[row.city] = (counts[row.city] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([city, count]) => ({ city, count }));
}

export async function getRecentVenues(limit = 6) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("listing_type", "venue")
    .not("lat", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Listing[];
}

export async function getFeaturedVenues(limit = 4) {
  // Get venues with the most courts as a proxy for "featured"
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("listing_type", "venue")
    .not("courts", "is", null)
    .order("courts", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Listing[];
}

/* ── Legacy queries (for existing London pages) ── */

export async function getFeatured(city: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("city", city)
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) return [];
  return (data ?? []) as Listing[];
}

export async function getListingsByType(city: string, type: ListingType) {
  // Try new schema first (listing_type: venue/coach)
  const mappedType = type === "court" ? "venue" : type;
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("city", city)
    .eq("listing_type", mappedType)
    .order("name", { ascending: true });
  
  if (!error && data && data.length > 0) return data as Listing[];

  // Fall back to old schema
  const { data: legacyData, error: legacyError } = await supabase
    .from("listings")
    .select("*")
    .eq("city", city)
    .eq("type", type)
    .eq("status", "published")
    .order("name", { ascending: true });
  if (legacyError) return [];
  return (legacyData ?? []) as Listing[];
}

export async function getListingBySlug(slug: string) {
  // Try without status filter first (new data doesn't have status)
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as Listing;
}

export async function getAllListings(city: string) {
  // Try new schema (no status filter)
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("city", city)
    .order("name", { ascending: true });
  if (error) return [];
  return (data ?? []) as Listing[];
}

export async function getListingCount(city: string) {
  const { count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("city", city);
  if (error) return 0;
  return count ?? 0;
}
