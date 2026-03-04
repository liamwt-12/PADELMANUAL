import { supabase } from "./supabase";
import type { Listing, ListingType } from "./types";

export async function getFeatured(city: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("city", city)
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) throw new Error(error.message);
  return (data ?? []) as Listing[];
}

export async function getListingsByType(city: string, type: ListingType) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("city", city)
    .eq("type", type)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Listing[];
}

export async function getListingBySlug(slug: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data as Listing;
}

export async function getAllListings(city: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("city", city)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Listing[];
}

export async function getListingCount(city: string) {
  const { count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("city", city)
    .eq("status", "published");

  if (error) return 0;
  return count ?? 0;
}
