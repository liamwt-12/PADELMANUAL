import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    await supabase.from("subscribers").upsert({ email, source: "website" }, { onConflict: "email" });
    const bdKey = process.env.BUTTONDOWN_API_KEY;
    if (bdKey) {
      await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: { Authorization: `Token ${bdKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email_address: email, type: "regular" }),
      });
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
