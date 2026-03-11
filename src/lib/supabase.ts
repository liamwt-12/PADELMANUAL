import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      // Build-time fallback: placeholder client for static generation without env vars.
      // Queries fail gracefully (db.ts returns [] / 0 on error). On Vercel, env vars are always set.
      _supabase = createClient('https://placeholder.supabase.co', 'placeholder');
    } else {
      _supabase = createClient(url, key);
    }
  }
  return _supabase;
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!service) return null;
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      service,
      { auth: { persistSession: false } }
    );
  }
  return _supabaseAdmin;
}
