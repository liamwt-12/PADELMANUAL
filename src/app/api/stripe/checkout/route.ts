import Stripe from "stripe";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://padelmanual.com";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price_data: { currency: "gbp", product_data: { name: "Founding London Partner — Padel Manual", description: "Premium profile, top placement, 2x Weekly Note features, locked founding rate for 12 months." }, unit_amount: 39900 }, quantity: 1 }],
    success_url: `${siteUrl}/partner/success`,
    cancel_url: `${siteUrl}/partner`,
    metadata: { city: "london", product: "founding_partner" },
  });
  return NextResponse.redirect(session.url!, 303);
}
