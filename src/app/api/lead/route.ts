import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, message, listing_id, source_page } = body;
    if (!email || !email.includes("@")) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    const { error } = await supabase.from("leads").insert({ email, name: name || null, message: message || null, listing_id: listing_id || null, source_page: source_page || null });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
