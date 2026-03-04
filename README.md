# Padel Manual

The modern guide to UK padel. Curated courts, coaches, gear, and leagues.

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Fill in your keys in .env.local
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables (see .env.local.example)
4. Deploy

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key (live) |
| `NEXT_PUBLIC_SITE_URL` | Production URL |
| `BUTTONDOWN_API_KEY` | Buttondown newsletter API key |
| `NEXT_PUBLIC_AMAZON_TAG` | Amazon Associates tag |

## Database

Run `supabase-schema-and-seed.sql` in your Supabase SQL editor. This creates all tables, enables RLS, and seeds 50 London listings.

## Stack

Next.js 15 · Supabase · Stripe · Buttondown · Tailwind CSS · Vercel
