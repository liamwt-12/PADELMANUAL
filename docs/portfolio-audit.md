# Padel Manual — Portfolio Audit

**Audit date:** 28 July 2026
**Product:** padelmanual.com — UK padel venue directory + venue-owner SaaS dashboard
**Repo:** `/Users/liam/Downloads/padelmanual` (124 commits, 4 Mar 2026 → 14 Apr 2026)
**Decision framed:** sell / agent-operate / mothball
**Method:** read-only. Live Stripe API, live Supabase (service-role REST + Auth admin), live production site, Buttondown API, DNS/WHOIS, git history, source read. No writes, no fixes.

> **Verification note.** Every figure below is marked `[verified]` (pulled from a live API or the production site during this audit), `[inferred]` (derived from evidence, reasoning shown), or `[estimate]` (not verifiable with available access — labelled and bounded). Access gaps are listed in §F.

---

## A. Commercial truth

### A1. Revenue — £0 external. All of it is the founder paying himself.

The Stripe account (`acct_1SwOMREOQ4ZTBEbM`, "Useful For Humans", GBP, live mode) is **shared across seven products**: Hauscope, Chocka, Delay Repay Pro, MapBoost, Owed, "again pro", and Padel Manual. Isolating Padel Manual required matching every subscription's price → product. [verified]

| Metric | Value |
|---|---|
| **MRR (external)** | **£0.00** |
| MRR (gross, incl. founder's own card) | £29.00 |
| **Lifetime revenue** | **£145.00** (5 invoices × £29) |
| Paying customers (external) | **0** |
| Paying customers (total) | 1 — `liamwt@hotmail.co.uk`, "Liam Watson" |
| Checkout sessions ever created | **1**, on 11 Mar 2026 (launch day) |
| Churn | n/a — no external customer has ever existed |

The single active Padel Manual subscription is `sub_1T9rLAEOQ4ZTBEbMfVvyGZbw`, "Padel Manual Premium" £29/mo, created 11 Mar 2026, customer `cus_U0aKhBOvUkAvXW` = `liamwt@hotmail.co.uk`. That same customer also holds a Delay Repay Pro subscription, and the name on the record is the founder's. Invoices paid: 11 Mar, 11 Apr, 11 May, 11 Jun, 11 Jul — all £29, all paid, next cycle 11 Aug. [verified]

Cross-checks run to make sure nothing was missed: every invoice on the account (100, all statuses, Feb 2026 → 26 Jul 2026) was scanned for a line item containing "Padel" — five hits, all the same customer. All 113 charges scanned for a Padel description — zero. All 89 checkout sessions expanded to line items — one Padel session, the founder's. [verified]

**Plainly: Padel Manual has never taken a pound from a stranger.** It is also a small live cash leak — the founder's card is billed £29/mo and Stripe takes its fee, so this costs money rather than making it.

The `venue_owners` table lists three accounts as `subscription_status = 'premium'` — `liamwt@hotmail.co.uk`, `demo@padelmanual.com`, `demo@manualpadel.com`. Only the first has a Stripe customer ID. The two demo accounts are premium by direct DB write, not by payment. [verified]

### A2. Usage — real but thin, and the flagship feature is dead

**Registered users.** 9 Supabase auth users total. [verified]

| Signed up | Email | Last sign-in |
|---|---|---|
| 11 Mar | liamwt@hotmail.co.uk (founder) | 13 Mar |
| 11 Mar | demo@padelmanual.com (demo) | never |
| 17 Mar | play@eastgrinsteadpadel.com | 17 Mar |
| 17 Mar | info@playtimepadel.com | 27 Mar |
| 20 Mar | info@gracedieupadel.com | never |
| 20 Mar | demo@manualpadel.com (demo) | 20 Mar |
| 8 Apr | martyn.collins@powerleague.com | 8 Apr |
| 14 Apr | manager@eppinggolfcourse.org.uk | never |
| 14 Apr | tom.seabridge@gmail.com | never |

**Active users (30 days): zero.** The most recent sign-in by anyone, founder included, was 8 April 2026 — 111 days ago. Three of the six external accounts never logged in once. [verified]

**Careful with the `venue_owners` count.** That table has 43 rows, which looks like 43 signups. It isn't. The `featured-venue` cron (`src/app/api/cron/featured-venue/route.ts`, Mondays 08:00 UTC) *creates a `venue_owners` row every week* for whichever unclaimed venue it picks, using a scraped contact email and a 7-day trial. Every Monday-dated row is machine-made. Nine of them carry `hello@padelmanual.com` (the code's fallback when a venue has no email); two carry `user@domain.com` and `yourname@domain.com` — placeholder strings scraped off venue websites. **Genuine human-initiated signups: 6 accounts across 4 days (17 Mar, 20 Mar, 8 Apr, 14 Apr).** [verified — cron source read, dates cross-checked against `outreach_log`]

**Traffic.** No Vercel Analytics or Search Console access (see §F), so the best available measure is the database's own view counters:

- Lifetime venue-page views: **5,229**, of which **1,266 are the demo listing**. Real venue-page views: **3,963** over 146 days ≈ **27/day**. [verified]
- Currently: **555 of 558 listings have a non-null `last_viewed_at`**, and **~15 distinct listings are viewed per day** across the last four weeks (min 2, max 42). [verified]
- Highest real venue: Gatwick Padel, 287 lifetime views. Next: 74, 65, 56, 55. The long tail is single digits. [verified]

**A trend claim I initially made and then withdrew:** bucketing `last_viewed_at` by month gives 30 / 22 / 27 / 64 / 412 for Mar–Jul, which reads as explosive growth. It isn't — the column stores only the *most recent* view, so every earlier month is cannibalised by later ones. The distribution is an artefact of the schema, not a growth curve. **I have no valid traffic trend.** Marked as a gap, not a signal.

**SEO reality across the programmatic estate.** The sitemap holds **2,869 URLs** [verified], considerably more than the ~950 in the brief:

| Family | URLs |
|---|---|
| `/gear/*` (products + categories) | 1,047 |
| `/padel/*` (area 384, station 179, near 98, city 244) | 905 |
| Root-level venue/coach pages | 558 |
| `/city/*` | 223 |
| `/courts/*` | 89 |
| `/guides/*` | 36 |
| `/play-today/*` | 11 |

All sampled URLs return HTTP 200. The site *is* indexed — a web search surfaces `/find`, `/padel/london`, `/padel/near/paddington` and two guide pages. [verified]

**But every page declares itself a duplicate of the homepage.** `src/app/layout.tsx:23-25` sets `alternates: { canonical: "https://www.padelmanual.com" }` in the root metadata. Next.js inherits that into every route that doesn't override it — and only **6 files override it** (all under `/guides`). So roughly **2,860 of 2,869 pages ship `<link rel="canonical" href="https://www.padelmanual.com"/>`**, confirmed in the live HTML of `/`, `/padel/station/kings-cross` and `/gatwick-padel`. [verified]

Google frequently ignores an obviously-wrong canonical, which is why some pages are indexed at all — but this is the single largest suppressor on the main asset, and it is a one-line fix. See §D1.

Secondary SEO problems: `/courts/ec` and `/padel/area/ec` are two templates over the same two venues (129 words vs 438 words) — genuine internal duplication across 89 + 384 URLs. And the scrape imported junk that is now live and in the sitemap: `/asdas` (a real Google Places record in Birmingham, 418 words, phone number and all), `/delete`, `/abc`, `/ds`, `/fa`, `/bounc`, `/suga`, plus `/the-northern-kraft-barbering` (a barber shop), `/sss-climbing-wall`, `/pickleball-bristol`, and `/pro-padel-ahmedabad` (India). [verified]

**Play Today — the feature promoted to primary CTA in the final commit — is dead.**

- `play_today_clicks` table: **0 rows.** [verified]
- Live API call `/api/play-today?lat=51.5074&lng=-0.1278` returns venues, but **every single one has `slots: []` and `has_availability: false`.** [verified]
- Root cause: the route calls the undocumented `api.playtomic.io/v1/availability`. Called directly from here it returns **HTTP 403, CloudFront "Request blocked"** — with the app's own User-Agent and with a browser UA. Playtomic is blocking it. [verified]
- The route swallows the error (`catch { return { venue, slots: [] } }`, `route.ts:198`), so a blocked upstream is indistinguishable from "no courts free". The page shows a plausible, wrong answer rather than an error.

The only Play Today numbers that exist anywhere are in `listing_stats_daily` — 14 rows, all for the demo listing, dated 6–19 March, i.e. seeded demo data. [verified]

**Reviews: zero real ones.** `venue_reviews` has 9 rows. All 9 are seeded — reviewer emails are `@demo.com` and `@example.com`, all on the two demo listings, all dated 3–20 March. No player has ever left a review. [verified]

**Affiliate earnings: £0.**

- `gear_clicks`: **16 clicks, lifetime**, 3 May → 11 Jul. [verified]
- **100% are `express_padel`. Decathlon clicks: 0.** The Decathlon integration built on 23 Mar has produced nothing: all 1,677 `gear_products` rows have `source = express_padel`, all point at Awin merchant `awinmid=24562`, and **`decathlon_url` is populated on 0 rows**. [verified]
- 16 clicks over five months cannot have produced meaningful commission at any plausible conversion rate and basket size. Awin dashboard not accessible (§F), but the click floor makes the answer certain: **£0, or within pennies of it.**

**Other engagement.**

- Newsletter: **1 Buttondown subscriber — the founder.** 16 weekly issues generated, **all still `status: draft`, none ever sent.** Draft generation stopped 11 Jun. One draft is titled *"This week: asdas + a Adidas pick"* — the junk listing reached the newsletter subject line. [verified]
- Player enquiries (`listing_leads`): 11 rows, of which 4 are March seed data matching demo reviewer names. **7 look genuine** — Barry Jessup (16 May), Allan McDonald (21 May), Nicki Boughton (28 May), Leanne (16 Jul), John Porter (17 Jul), Martyn (24 Jul), Shlok Chaudhary (24 Jul). **All 11 are `contacted: false`.** Four arrived in the last 14 days. [verified]
- Venue submissions: 2 rows, both the same venue submitted twice by the same person. [verified]

### A3. Costs — small, and mostly shared

Nothing here is separately invoiced to Padel Manual; every provider account is shared with the other six products. Figures below are the **marginal** cost of keeping this one product alive.

| Item | Monthly | Basis |
|---|---|---|
| Vercel (share) | ~£4 | Pro plan `[inferred]` — `vercel.json` runs **6 cron jobs**; Hobby caps at 2 and once-daily, and Hobby bars commercial use. $20/mo team seat ÷ 7+ products ≈ £2–5. `[estimate]` |
| Supabase (dedicated project) | ~£8 | Org `brshcusmckvnuvcajddu` holds **7 projects**; free tier allows 2 active per org, so the org is Pro `[inferred]`. Marginal compute for one extra project ≈ $10/mo ≈ £8. `[estimate]` |
| Domain padelmanual.com | ~£1.25 | 123-Reg, renews **28 Feb 2027**. ~£15/yr `[estimate]` |
| Resend | £0 | Free tier. Actual volume ~8 emails/month `[verified from outreach_log]` |
| Zoho Mail (MX on zoho.eu) | £0–1 | Free tier likely `[estimate]` |
| Buttondown | £0 | Free tier, 1 subscriber `[verified]` |
| Google Maps/Places | ~£0 | Legacy Places API is **disabled on the project** `[verified]`; only Maps Embed still resolves. See §C2 for the uncapped-abuse risk. |
| Anthropic API | £0 | AI crons stopped producing output mid-June `[verified]` |
| Playtomic | £0 | Unauthenticated scrape, now blocked |
| **Total marginal** | **~£13–15/mo** | |
| **Annual** | **~£160–180** | |

Add the £29/mo the founder is currently paying himself through Stripe (net cost: the Stripe fee, ~£0.72/mo) and the true out-of-pocket is **~£14–16/month, ~£175–195/year**. This is a cheap thing to own.

### A4. Growth signal — no.

Honestly: **nothing is growing without attention.**

- Signups/week: 0. Last account created 14 Apr, 105 days ago. [verified]
- Logins: 0 in the last 111 days. [verified]
- Revenue: 0 external, ever. [verified]
- Reviews: 0 real, ever. [verified]
- Gear clicks: 16 lifetime, most recent 11 Jul. [verified]
- Newsletter: 1 subscriber, 0 issues sent. [verified]

The one thing that *is* alive is passive organic traffic: roughly **15 distinct venue pages viewed per day**, and 7 genuine player enquiries have arrived through the site since May — four of them in the last two weeks. That is real demand landing on the pages. It just converts to nothing, because there is no product on the other side of it and nobody answers the enquiries.

I want to be precise about what I can't say: **I cannot tell you whether that traffic is rising or falling.** Vercel Analytics is installed and collecting, but I have no read access, and there is no Search Console link in the repo. Getting one month of that data is the cheapest way to make this decision better-informed.

---

## B. Operational load

### B1. The recurring task inventory

**Crons currently scheduled** (`vercel.json`) — all six still deployed:

| Cron | Schedule | What it does | Actually working? |
|---|---|---|---|
| `featured-venue` | Mon 08:00 | Picks an unclaimed venue, creates a `venue_owners` trial row, **emails the scraped venue contact**, queues a day-6 follow-up, emails admin | **Yes — ran 27 Jul** |
| `trial-followup` | Daily 09:00 | Sends the queued day-6 follow-up | **Yes — ran 26 Jul** |
| `check-notifications` | Daily 08:00 | Checks broken booking URLs, unanswered reviews, rating changes for premium owners | Yes — but see below |
| `weekly-report` | Mon 08:00 | Weekly stats email to premium owners | Runs; audience is the founder + 2 demo accounts |
| `generate-briefs` | Mon 07:00 | AI competitor-intelligence briefs (Claude) | **No — last output 15 Jun** |
| `generate-gbp-posts` | Thu 10:00 | AI Google Business Profile post drafts (Claude) | **No — last output 11 Jun** |

Two crons (`outreach`, `outreach-sequence`) were removed from `vercel.json` on 14 Apr in commit `0f65c4f` *"disable cold outreach crons — stop automated venue emails"*. **That commit did not achieve its stated purpose** — see §B4.

`check-notifications` has a defect worth naming: `venue_notifications` holds **548 rows, of which 512 are type `review_unanswered`** — 107 of them in July alone, ~3.5/day. It re-raises the same notification for the same nine seeded demo reviews every single day and never dedupes. It will grow forever. [verified]

**Data freshness — there is no refresh pipeline at all.** This is the most important operational finding in this section.

- All 558 listings were created in **March 2026**. Not one has been created since. [verified]
- `google_data_updated_at`: **populated on 0 of 558 rows.** `playtomic_data_updated_at`: **0 of 558.** These columns exist, and nothing has ever written to them. [verified]
- `content_enrichment_log` (the AI description enricher): 381 rows, **all in March 2026**, nothing since. [verified]

So venue data is a single March 2026 scrape, four and a half months stale, with no mechanism — manual or automated — to refresh it.

**Content completeness is poor for a directory:**

| Field | Filled |
|---|---|
| `lat` | 533/558 (96%) |
| `website_url` | 472/558 (85%) |
| `description` | 465/558 (83%) |
| `google_place_id` | 453/558 (81%) |
| `courts` | 420/558 (75%) |
| `address` | 395/558 (71%) |
| `phone` | 372/558 (67%) |
| **`booking_url`** | **43/558 (8%)** |
| **`courts_count`** | **45/558 (8%)** |
| **`price_from`** | **0/558 (0%)** |
| **`opening_hours_text`** | **0/558 (0%)** |
| **`hero_image_url`** | **1/558 (0%)** |
| **`google_rating`** | **1/558 (0%)** |

Price, opening hours, images and Google ratings — four of the things a padel player actually wants — are empty across the board. [verified]

There are also 5 duplicate venue pairs sharing a Playtomic tenant ID, including one where **two different venues (Rocket Padel Battersea and Powerleague Shoreditch) are mapped to the same tenant** — so one of them would show the other's availability if availability worked at all. [verified]

**Review moderation:** nothing to moderate. 9 reviews, all seeded, all auto-approved. But note §C2 — the moderation queue is bypassable by design.

**Support / user contact, last 90 days.** I could not read the `hello@padelmanual.com` inbox (Zoho, no credentials — §F), so this is measured from database records of inbound contact:

| Channel | Volume | State |
|---|---|---|
| `claim_requests` | **10 rows, 100% `status: pending`** | Oldest 17 Mar (133 days), newest 14 Apr (105 days). **None ever actioned.** |
| `listing_leads` | 11 rows (7 genuine), **all `contacted: false`** | 4 arrived in the last 14 days |
| `venue_submissions` | 2 (same venue twice) | Marked approved |
| `outreach_optouts` | **11 people asked to be removed** from cold email | Recorded |

Ten real venue operators — Duncan Maclay (East Grinstead), Kieran Coleman (Playtime Padel, 6 venues), Kerem Karacayli (Grace Dieu), Ellie (Epping Golf), Tom Seabridge — submitted claim requests and **none have ever received a response**. [verified]

**Partner/venue-owner interactions:** effectively one real relationship — Martyn Collins at Powerleague claimed 13 venues on 8 April and has not returned since. [verified]

**Billing admin:** one subscription, the founder's own. Zero load.

### B2. Honest founder-hours

- **Currently spent: ~0 hours/month.** Last commit 14 Apr. Last login 8 Apr. Ten claim requests and eleven leads sit unanswered. The product has been running with literally zero attention for 105 days.
- **Minimum to keep it *healthy*: 6–10 hours/month.** Roughly: 2–3h refreshing venue data (there is no automation to lean on — it would be manual), 1–2h answering claims and forwarding player leads, 1h moderating/checking the site still works, 1–2h content, 1h admin. Plus a one-off remediation block (see §C, §D) before any of that is worth doing.
- **Minimum to keep it *serving*: ~0.5 hours/month.** Which is what it is getting.

### B3. What degrades with 90 days of zero attention

**This is not hypothetical — the experiment already ran.** The product has had ~105 days of zero attention, and here is exactly what broke:

1. **Play Today died.** Playtomic started returning 403; the feature has silently shown "no availability" for every venue ever since.
2. **The Google reputation feature died.** The legacy Places API was disabled at the Google project level; `/api/venue/google-reviews` cannot work.
3. **Both AI crons died** (11–15 Jun) and nobody noticed. Briefs and GBP posts stopped.
4. **The newsletter died** — 16 drafts, 0 sent, generation stopped 11 Jun.
5. **10 claim requests and 11 player leads went unanswered**, some now 4+ months old.
6. **Venue data went stale** — a March scrape, never refreshed, including 6 venues now flagged permanently closed and 13 listings whose slugs advertise openings that were already in the past when scraped (`/fort-dunlop-opening-mid-april-2025`, `/sevenoaks-padel-opening-nov-24`, `/open-jan-2025-tennis-england-club`, `/padel-pass-luton-...-open-summer-2025`).
7. **A junk table grew by ~320 rows** of duplicate notifications.
8. **The cold-email cron kept firing** — see next.

What did *not* degrade: the site stays up, serves fast, and keeps taking organic traffic. Vercel + Supabase need no babysitting.

### B4. ⚠️ Cold outreach is still running — 105 days after it was "disabled"

Commit `0f65c4f` (14 Apr) removed the `outreach` and `outreach-sequence` crons from `vercel.json`. It **left `featured-venue` and `trial-followup` in place**, and both of those send unsolicited email to scraped venue contact addresses.

**30 emails have been sent since that commit** [verified from `outreach_log`], including to real third parties:

- 4 May → info@padel-padel.uk
- 11 May → hello@padelwarehouse52.co.uk
- 18 May → hello@carbonpadelclub.co.uk
- 29 Jun → purchaseinvoices@thehivelondon.com
- 6 Jul → enquiries@powerleague.co.uk
- **27 Jul (yesterday) → theo2@padelsocial.club**
- **Queued and pending: 2 Aug 2026 → theo2@padelsocial.club**

Two of the sends went to `user@domain.com` and `yourname@domain.com` — placeholder strings scraped off venue websites, i.e. guaranteed bounces against the sending domain's reputation.

The emails go out as *"Liam at Padel Manual"* from `hello@padelmanual.com`, using a scraped B2B contact list, with 11 recorded unsubscribe requests already on file. Whatever view one takes on UK PECR/GDPR for B2B direct marketing, **an automated cold-email system running unsupervised on a product nobody is watching is a live liability**, and it is currently the only thing the product does reliably. Flagging, not fixing, per the brief.

---

## C. Technical state & transferability

### C1. Shared personal infrastructure

| Asset | State | Untangling needed |
|---|---|---|
| **Supabase** | **Dedicated project** `bzzpyqwsuqnswwvbuksh` ("Padel Manual", West EU/Ireland), inside personal org `brshcusmckvnuvcajddu` ("Liam") **shared with 6 other products** (claimtrack, MapBoost, again, night notes, owed, chocka index) | **Low.** Supabase supports project transfer between orgs. Clean boundary — no other product's data is in this project. ✅ |
| **Stripe** | **Shared account** `acct_1SwOMREOQ4ZTBEbM` ("Useful For Humans") carrying all 7 products' customers, prices and 96 paid invoices | **High-ish, but moot.** Stripe accounts don't split. A buyer gets a new account. Since there are **no customers to migrate**, this is a non-issue in practice — just delete/archive the Padel Manual products and prices. ✅ |
| **Resend** | Shared key, restricted to send-only. Domain `padelmanual.com` verified for sending | **Low.** Buyer provisions their own key. |
| **Zoho Mail** | MX on `zoho.eu`, `hello@padelmanual.com` | **Low**, but the mailbox holds the only copy of inbound support history. |
| **Google Cloud** | Personal project. Legacy Places API disabled; OAuth client for Google Business Profile with redirect `https://padelmanual.com/api/gbp/callback` | **Medium.** New GCP project + re-verified OAuth consent screen. GBP scopes need Google review. |
| **Anthropic** | Key not in `.env.local`; set only in Vercel env, and evidently broken since mid-June | **Low.** |
| **Buttondown** | Shared key, 1 subscriber | **Trivial.** |
| **Awin** | Publisher ID `2799`, merchant 24562 hardcoded into all 1,677 affiliate URLs | **Medium.** A buyer must re-write every affiliate URL to their own publisher ID, or they are sending traffic to the seller's account. Mechanical, one SQL update. |
| **Vercel** | Project `prj_RUOTQmB7urqvoFl7M1q0ovEgCoYC` in team `team_g1RLoiOt6dBpVrqtGAhcEotN` (shared) | **Low.** Vercel supports project transfer. |
| **Domain** | `padelmanual.com` at **123-Reg**, registered 28 Feb 2026, **expires 28 Feb 2027**, registrant privacy via Domains By Proxy, `clientTransferProhibited` set, DNS delegated to GoDaddy nameservers | **Low.** Unlock, get auth code, transfer. **Note the 7-month renewal runway.** |
| **Twilio** | Not used. `whatsapp_number` is a plain listing field, no Twilio integration exists. | None. |

**Verdict on transferability of infrastructure: better than typical.** The Supabase project is dedicated, the Vercel project is discrete, and the shared Stripe account doesn't matter because there is nothing to migrate.

### C2. ⚠️ Security and data findings a buyer's diligence would surface

These are reported, not fixed, per the brief. Four are material.

**1. Public anon key can write to seven tables — including auto-approved reviews.**

The Supabase anon key is a `role: anon` JWT and is **served in the public JS bundle** (confirmed: `/_next/static/chunks/76651a279bf13502.js` on `/claim` contains the project ref and key). Probing RLS with deliberately-invalid payloads — which fail on a constraint *after* the policy passes, so nothing was written — shows insert is **permitted** for:

`outreach_log` · `venue_reviews` · `claim_requests` · `venue_notifications` · `intelligence_briefs` · `listing_stats_daily` · `gear_clicks`

The worst of these is `venue_reviews`. The failing-row dump from Postgres shows the `approved` column **defaults to `true`**. So anyone on the internet can post a review of any venue and have it appear publicly with no moderation step. On a directory of ~530 named real-world businesses, that is a defamation and content-injection vector. `listing_stats_daily` being anon-writable means the (paid) analytics dashboard can be forged.

Correctly blocked: `venue_owners`, `listings`, `listing_leads`. [all verified]

**2. Public anon key can read owner-private data.**

Anonymous SELECT returns full tables: **`outreach_log` (329 rows of venue contact email addresses and outreach history)**, `intelligence_briefs` (23), `venue_notifications` (548), `listing_stats_daily` (14), `venue_reviews` (9). The outreach log includes personal-format addresses (`martyn.collins@powerleague.com`, `dan.arnot@woodfordwells.org.uk`, `theo2@padelsocial.club`) alongside role addresses — that is personal data, publicly readable. [verified]

**3. `/api/admin/send-demo` has no authentication.**

Every other admin route checks `ADMIN_SECRET`; this one doesn't (`src/app/api/admin/send-demo/route.ts` — no auth check anywhere in the file). It accepts an arbitrary `email` in the POST body and then:
- calls `supabase.auth.admin.generateLink()` to mint a **valid magic-link token for `demo@manualpadel.com`** (an account with `subscription_status: premium`), and
- **sends it from `hello@padelmanual.com` to whatever address the caller supplied.**

That is both an unauthenticated session-granting endpoint and an open email relay on the production sending domain. I confirmed the missing auth by code inspection and confirmed the route is live (returns 500 on an empty body — the catch path — rather than 401). **I did not exercise it**, because doing so would send mail.

**4. Google API key is published on 558 pages and is unrestricted.**

`src/app/[slug]/page.tsx:220` interpolates `process.env.GOOGLE_PLACES_API_KEY` directly into a Maps Embed iframe `src`, which is server-rendered into public HTML. Confirmed live on `/gatwick-padel`; the key in the page source is byte-identical to `GOOGLE_PLACES_API_KEY` in `.env.local`. Calling Maps Embed with that key from this machine, with no HTTP referrer, returns **HTTP 200** — so there is no referrer restriction and anyone can bill Google against it. (Legacy Places textsearch returns `REQUEST_DENIED — legacy API not enabled`, which is why `/api/venue/google-reviews` is broken.) [verified]

**Lesser items:**
- Admin auth is a single shared password stored as the **raw secret in a 30-day cookie** (`admin/login/route.ts`), no hashing, no rate limiting. HttpOnly and Secure are set.
- `.env.local` is correctly gitignored and has never been committed. ✅ [verified]

**Personal data held:** venue-owner emails/names (43 rows + 9 auth users), player lead names/emails/messages (11), claim-request names/emails/phones (10), scraped venue contact emails (329 in `outreach_log`, plus `contact_email`/`email` on 308 listings), Google OAuth access + refresh tokens on `venue_owners`, and 11 opt-out records.

**Privacy policy:** exists at `/privacy`, effective 12 Mar 2026, and is genuinely well-written for a solo project — clear collection list, no-sale commitment, named sub-processors (Stripe, Resend, Google, Supabase), stated rights and a 30-day response SLA. Its gaps: it **does not mention the scraped venue contact database or the cold-email programme at all** (no lawful-basis statement for direct marketing), omits Vercel Analytics, Buttondown and Anthropic from the sub-processor list, and names no legal entity beyond "Useful for Humans" — no company number, no registered address, no ICO registration. [verified by reading the live page]

### C3. Code health

Next.js 16 App Router / React 19 / TypeScript in `strict` mode / Tailwind 3 / Supabase (Postgres + Auth + RLS) / Stripe / Resend / Buttondown, deployed on Vercel with git-push CI and six Vercel Crons — a conventional, current, boring stack that a competent Next.js developer would be productive in on day one. Routes are small and readable, the App Router conventions are used properly, `revalidate` is set sensibly across the programmatic pages, and there is no framework weirdness or bespoke build tooling. The embarrassing parts are real but shallow: **zero tests of any kind**; the root-layout canonical bug that tells Google 2,860 pages are duplicates of the homepage; an API key interpolated into public HTML; an unauthenticated admin endpoint; silent `catch {}` blocks that turn upstream failures into empty-but-successful responses (which is precisely why nobody noticed Play Today dying); a notification cron with no dedupe that has written 512 junk rows; RLS policies that were clearly written permissively and never revisited; **the schema exists only in the live database — `README.md` tells a new owner to run `supabase-schema-and-seed.sql`, and that file is not in the repo**; and one uncommitted working-tree change to `src/app/api/play-today/route.ts` (widening the "now" window from 2h to 4h and the evening window to 23:59) that looks like an abandoned attempt to debug the empty availability results — the real cause being the upstream 403, which no window widening can fix.

### C4. Transfer effort: **M**

Not S, because of a required pre-sale remediation block. Not L, because the infrastructure boundaries are unusually clean.

**S-sized (mechanical, ~1 day):** transfer Vercel project, transfer Supabase project, unlock + transfer domain, hand over Zoho, buyer provisions Resend/Anthropic/Buttondown keys, one SQL update to swap the Awin publisher ID across 1,677 rows.

**What makes it M (~3–5 days):** dump the schema into the repo (it isn't there); fix the four security findings in §C2 before handing anyone a database containing third parties' personal data; **stop the cold-email crons for real**; rebuild the Google Cloud project and re-verify GBP OAuth; and write a short honest disclosure of what's broken (Play Today, Google reviews, both AI crons) so the buyer doesn't discover it in week two.

---

## D. The three futures

### D1. SELL

**What a buyer actually gets:**

| Asset | Real value |
|---|---|
| `padelmanual.com` domain | Good, memorable, exact-category .com. Renews Feb 2027. **The single most valuable item.** |
| 2,869 indexed-eligible pages | Genuine breadth. Undermined by the site-wide canonical; ~500 gear pages are affiliate-thin. |
| ~15 distinct venue pages/day of organic traffic | Real, small, trend unknown |
| 558 listings (528 venues, 30 coaches) | Broadest UK padel dataset here, but March-only, no price/hours/images, ~13 junk records |
| 329 scraped venue contact emails | **A liability, not an asset** — see §B4 and §C2 |
| User base | **6 real accounts, 0 active, 0 paying.** Effectively nil |
| Venue relationships | **One** (Powerleague, dormant since April) |
| Codebase | Clean modern Next.js, reusable, no tests |
| Stripe/MRR | Nothing to transfer |

**What blocks a clean transfer:** the four security findings (a buyer's technical diligence will find the anon-write RLS in ten minutes); the live cold-email cron; the missing schema file; the Awin publisher ID baked into every product URL; GBP OAuth re-verification; and the honest disclosure that the two headline features (Play Today, Google reviews) don't work.

**Realistic price.** With £0 revenue there is no SDE and therefore no multiple. This is a domain-plus-assets sale, and the comparables are unambiguous:

- Micro-SaaS sells at ~2.85× annual profit on average (top quartile 6.13×), and deals under $100K close at ~1.68× — [Flippa 2026 data via bigideasdb](https://bigideasdb.com/saas-valuation-guide-2026). **All of which multiply by zero here.**
- Zero-revenue sites on Flippa transact in the **$2,000–$5,000** band, and buyers are explicitly paying for build time saved, not for a business — [Flippa zero-revenue analysis](https://medium.com/@celebmd/i-discovered-people-are-selling-zero-revenue-websites-for-2-000-5-000-on-flippa-6e065a9b8f6a), [Flippa valuation guidance](https://gauravtiwari.org/flippa-value-sell-a-website-with-no-revenue/).
- Profitable niche directories reach 25–48× monthly profit — [Directorist](https://directorist.com/blog/online-directory-business-model/) — which is the band this *would* be in with even £300 MRR, and is exactly what it is not in.

**Honest range: £1,500–£4,000 as-is** (a domain sale with a dataset and a codebase attached). **£3,000–£6,000 after cheap remediation.** Above that you would need paying venues, and there are none.

Two things temper it further. The category already has incumbents with a head start — [The Padel Directory](https://www.thepadeldirectory.co.uk/) (sponsored by Vitality), [Padelmaniacs](https://padelmaniacs.uk/), padelcourtfinder.com — so a buyer has alternatives. And the most likely buyer is one of those competitors buying the domain and the dataset, not the business.

**What would most increase price cheapest — in order of return per hour:**

1. **Delete four lines from `src/app/layout.tsx`** (the `alternates.canonical` block) and let each route emit its own canonical. This is the highest-leverage change available anywhere in this audit: it currently tells Google that ~2,860 pages are duplicates of the homepage. **Minutes of work, and it is the difference between selling "2,869 pages" and selling "2,869 pages Google is allowed to index."**
2. **Get 30 days of Vercel Analytics / Search Console data.** A buyer pays for evidence. "~15 venue pages/day and here's the trend" is a sellable fact; "no analytics" caps the price at domain value. Free.
3. **Fix Play Today or remove it.** A headline feature that silently returns nothing will be found and will cost more in trust than it adds in features.
4. **Fix the four security findings and stop the cold-email cron.** These don't add price; they prevent the deal collapsing at diligence.
5. **Delete the ~13 junk listings** (`/asdas`, `/delete`, `/abc`, the barber shop, the Ahmedabad venue). An hour, and it stops the dataset looking unmaintained.

Items 1, 2 and 5 are perhaps **half a day of work** and plausibly move the number by more than everything else combined.

### D2. AGENT-OPERATE

Mapping §B's inventory against what an agent could genuinely run:

| Task | Verdict | Why |
|---|---|---|
| SEO/content generation (city guides, gear copy, briefs) | **Unattended** ✅ | Already how the existing content was made; the AI crons worked until the key broke |
| Venue data refresh (re-scrape Places, detect closures, fill price/hours) | **Unattended** ✅ | The highest-value automatable task, and the one that doesn't exist yet |
| Junk-listing detection and cleanup | **Unattended** ✅ | Trivially agent-shaped |
| Broken-link / feature-health monitoring | **Unattended** ✅ | Would have caught the Playtomic 403, the disabled Places API and both dead crons **months** ago |
| Review moderation | **Assisted** ⚠️ | Agent triage is fine; publishing user content about named real businesses needs human sign-off — especially given the anon-write hole |
| Forwarding player leads to venues | **Assisted** ⚠️ | Content is safe to draft; sending on someone's behalf is not |
| Answering claim requests | **Assisted** ⚠️ | Verifying that a stranger owns a business is a judgement call |
| **Venue-owner cold email** | **Never** ❌ | Direct marketing to scraped contacts, unsupervised, is exactly the failure already in flight (§B4). Automating it harder is the wrong direction. |
| Payments / billing admin | **Never** ❌ | Refunds, disputes, tax — needs an accountable person |
| Legal accountability (GDPR/DSAR, privacy policy, ICO, defamation exposure on 530 named businesses) | **Never** ❌ | Requires a named human controller |

**The honest arithmetic.** Agents would save **6–10 hours/month** — but that is the load of a *healthy* product, and this product currently consumes **~0 hours/month**. You cannot automate away work nobody is doing. Setup would be **15–25 hours** (build the refresh pipeline that doesn't exist, wire monitoring, define escalation), plus **1–2 hours/month** of supervision, and the supervision cost lands on tasks that were never being done anyway. Payback against actual current effort: **never**.

**As leverage, this fails. As a showcase, it's the best candidate in the portfolio.** The demo writes itself and it is genuinely impressive: *"this product ran unattended for 105 days; here are the four things that silently broke, none of which a human noticed, all of which an agent watching would have caught within a day."* That is a real, honest, dated story about agent value with production evidence behind it. Value it as **portfolio/marketing content**, priced at the ~20 hours it costs to build — **not** as an operating-cost reduction, because the operating cost it reduces is zero.

One hard constraint: **an agent cannot be the data controller.** Any agent-operated future still needs a named human on the privacy policy, the ICO registration and the abuse mailbox.

### D3. MOTHBALL — the Chocka playbook

**What it looks like:** waiting-list the signup and claim flows, keep all 2,869 pages serving, cut the cron set to nothing (or to a monthly link-health check), leave affiliate links live, keep the domain renewed.

**Monthly cost: ~£13–15** (~£160–180/yr) — and Supabase drops toward free-tier if the project is the org's spare. Realistically **£10–15/month** to keep the lights on.

**Residual risk — stale venue data misleading users. Assessed honestly: this is the real risk, and it is already materialising.**

The data is a March 2026 scrape with **no refresh mechanism that has ever run** (`google_data_updated_at`: 0/558). Today, ~15 people a day land on venue pages showing:

- **6 venues flagged permanently closed** (correctly excluded from queries since 14 Apr — that fix works ✅)
- **13 listings whose slugs advertise openings already in the past** — `/fort-dunlop-opening-mid-april-2025`, `/sevenoaks-padel-opening-nov-24`, `/open-jan-2025-tennis-england-club`, `/padel-pass-luton-...-open-summer-2025`, `/barnton-cricket-club-coming-soon-planning-to-open-in-mid-april`
- **372 phone numbers and 395 addresses** that were correct in March and have been verified by nobody since
- **Zero prices and zero opening hours** — so a user cannot even be misled about them, which is its own kind of failure
- **A Play Today page that tells every user no courts are available anywhere in the UK, at any time**

That last one is the sharpest reputational risk and it is worse than staleness — it is a confident, specific, wrong answer delivered as fact. A player checking "can I play in London tonight" is told no. Every time.

And the seven genuine enquiries since May prove people *are* trying to transact through these pages. Mothballing without a visible "listings last verified March 2026" caveat and without either fixing or removing Play Today means continuing to give real people wrong answers about real businesses.

**Mothball is cheap and low-effort, but it is not zero-obligation.** The honest version requires four things first: **stop the cold-email crons** (this is not optional — see §B4), **remove or clearly disable Play Today**, **stamp the venue data with its March 2026 vintage**, and **close the anon-write RLS holes** so the site can't be used to publish unmoderated content about named businesses while nobody is watching. Call it a day's work to mothball *responsibly* versus zero to mothball *negligently*.

---

## E. Verdict

**The evidence supports MOTHBALL — after a day of remediation — with an opportunistic domain sale as the upside case, and I'd take the half-day of SEO/analytics work first because it is nearly free and it is the only thing that could change the answer.** The commercial case is not ambiguous: one checkout session in 146 days, zero external revenue, zero active users, zero real reviews, 16 affiliate clicks lifetime, and one newsletter subscriber who is the founder. Against that, the running cost is ~£14/month and roughly 15 people a day still find the venue pages and seven of them have tried to make contact since May — which is why the answer is mothball rather than shut down: the traffic is real, the cost is trivial, and the domain is genuinely good. Agent-operation fails on arithmetic (it would automate 6–10 hours/month of work that nobody is currently doing, at a setup cost of 20+ hours) but is the portfolio's best *showcase* candidate, because the 105-day unattended experiment already ran and produced four silent failures an agent would have caught in a day. **What would change the answer:** one month of real analytics showing organic traffic actually climbing — the canonical bug means the SEO estate has never been fairly tested, and if 2,860 pages started being indexed properly and traffic doubled, the sale value moves from domain-money to directory-money and the agent case gets a job worth doing. That test costs about half a day.

**The number that most surprised me: one.** One Stripe checkout session in the product's entire life — created by the founder, on launch day, on his own card. Not a low conversion rate. Not a churn problem. In 146 days, no stranger ever reached the payment page. That single figure reframes everything else in this audit: the 2,869 pages, the six crons, the AI briefs, the GBP integration, the multi-venue dashboard, the impersonation tooling — all of it was built past a demand signal that never once fired.

### ⚠️ Flagged, not fixed

Ordered by urgency:

1. **Cold email is live right now.** `featured-venue` and `trial-followup` survived the 14 Apr "disable cold outreach" commit and have sent **30 emails since**, most recently to `theo2@padelsocial.club` **yesterday (27 Jul)**, with the next one **queued for 2 Aug**. Two went to scraped placeholder addresses. 11 people have already asked to be removed. This is unsupervised direct marketing from a product nobody is watching.
2. **`/api/admin/send-demo` is unauthenticated** — it mints a valid magic-link session for a premium account and emails it from `hello@padelmanual.com` to any address a caller supplies. Session-granting endpoint and open relay in one.
3. **The public anon key can insert auto-approved reviews** on any of ~530 named real businesses (`approved` defaults to `true`), and can also write to `outreach_log`, `claim_requests`, `venue_notifications`, `intelligence_briefs`, `listing_stats_daily`, `gear_clicks`.
4. **The public anon key can read 329 scraped venue contact emails** plus all owner-private briefs, notifications and stats.
5. **`GOOGLE_PLACES_API_KEY` is server-rendered into the public HTML of all 558 venue pages** and has no referrer restriction — confirmed billable by an arbitrary caller.
6. **Site-wide canonical points every page at the homepage** — ~2,860 of 2,869 pages self-declare as duplicates. Four lines in `src/app/layout.tsx`.
7. **Play Today returns a confident wrong answer to every user** — Playtomic blocks with 403; the error is swallowed and rendered as "no availability".
8. **Both AI crons and the newsletter died 11–15 June** and nothing surfaced it.
9. **10 claim requests (oldest 133 days) and 11 player leads have never been answered** — real named people awaiting a reply.
10. **`venue_notifications` grows ~3.5 junk rows/day forever** — 512 duplicate `review_unanswered` entries and counting.
11. **The database schema exists only in the live database.** `README.md` points a new owner at `supabase-schema-and-seed.sql`, which is not in the repo.

---

## F. Access gaps — what I could not verify

Stated plainly so the numbers above aren't over-read:

| Gap | Effect | How to close |
|---|---|---|
| **Vercel Analytics** — installed and collecting, no read access (no CLI auth, no API token) | **No pageview totals, no traffic trend, no top sources, no referrers.** The biggest gap in this audit; §A2 uses DB view counters as a proxy | Vercel dashboard, or a read token |
| **Google Search Console** — no property linked in repo | No impressions, no query data, **no idea how many of the 2,869 pages are actually indexed** | Verify the property |
| **Awin publisher dashboard** — no credentials | Affiliate earnings not directly confirmed (16 lifetime clicks make £0 near-certain) | Awin login |
| **`hello@padelmanual.com` inbox** (Zoho) — no credentials | Support volume measured from DB records only; direct email enquiries invisible | Zoho login |
| **Resend logs** — API key is send-only restricted (`401 restricted_api_key`) | Cannot confirm delivery/bounce rates on the cold-email sends | Full-access Resend key |
| **Vercel / Supabase billing** — no access | Cost figures in §A3 are inferred from plan-feature evidence (6 crons > Hobby's 2; 7 projects > free tier's 2) and marked `[estimate]` | Billing dashboards |
| **`/api/admin/send-demo` exploitation** | Missing auth confirmed by code inspection; **deliberately not exercised**, as doing so would send an email | — |

---

## G. Addendum — stop-the-bleeding session, 28 July 2026

The verdict was taken as **mothball**. This section records what was actually changed, so the
audit above is read as the "before" picture. Three commits: `22b2be2`, `422e8c7`, and the
commit carrying this addendum.

**Killed.** Cold outreach is off at three layers — `featured-venue` and `trial-followup`
removed from `vercel.json`, all four outreach handlers replaced with 410 stubs containing no
send logic, and the admin dashboard's manual "Send Outreach" and "Trigger featured venue"
controls removed. The queued 2 Aug email to `theo2@padelsocial.club` was deleted from
`outreach_log`; the pending queue is now empty. `/api/admin/send-demo` is deleted.
`check-notifications` is disabled. Play Today now returns an explicit 503 unavailable state
and the pages say live availability is paused rather than rendering "no courts available" as
fact; the primary-CTA placement is gone from the homepage hero and the nav. The site-wide
`alternates.canonical` is removed from the root layout, so pages emit their own canonical.
19 junk listings were deleted (558 → 539), along with 13 orphan `outreach_log` rows, 16
`content_enrichment_log` rows and the 2 cron-created placeholder `venue_owners` rows. Venue
pages now carry "Listings last verified March 2026."

**Corrections to §C2 — the RLS exposure was worse than reported.** The audit probed INSERT
only and named 3 tables with RLS gaps. The true position was that **RLS was disabled outright
on 7 tables** while `anon` held full `SELECT/INSERT/UPDATE/DELETE/TRUNCATE` grants — so the
exposure included **deleting** data, not just inserting it. Most sharply: anyone could have
wiped `outreach_optouts`, the email suppression list. A second root cause accounted for 4 more
tables: policies named "Service role full access on *table*" had been created for `PUBLIC`
rather than `service_role`, with `USING true` / `WITH CHECK true`. All 12 tables are now
locked (migration `supabase/migrations/20260728090000_mothball_lock_down_anon_access.sql`),
`venue_reviews.approved` defaults to `false`, and anon retains exactly one read — approved
reviews, which `/[slug]` renders. Verified with the same anon-key probes: 12/12 blocked for
write, 11/11 blocked for read, public site reads unaffected.

**Still open — Liam's own actions, outside this session:**

- Cancelling the £29/mo self-subscription in Stripe.
- Restricting `GOOGLE_PLACES_API_KEY` in the Google Cloud console. The key is still
  server-rendered into the public HTML of every venue page and was confirmed usable by an
  arbitrary caller with no referrer. **Not yet verified as restricted.**

**Known-open, accepted for now:**

- Six guide pages still describe Play Today in the present tense as a live availability tool
  ("shows you which courts near you have slots open right now"). The pages they link to now
  say otherwise, so a reader gets the truth on arrival, but the prose is stale.
- `authenticated` still holds broad table grants; RLS policies now gate it, but the grants
  themselves were left as found.
- The `venue_owners` table still contains ~20 cron-manufactured trial rows beyond the two
  placeholder ones removed. They are inert now the cron is dead.

---

*The audit in §A–F was read-only: no application code, configuration, database row or
third-party setting was modified while it was written. §G records the changes made in a
subsequent session at the user's direction.*
