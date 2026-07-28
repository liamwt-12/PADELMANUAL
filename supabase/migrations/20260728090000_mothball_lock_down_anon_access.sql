-- 2026-07-28 — Mothball hardening: close public (anon) read/write holes.
--
-- Two root causes, found during the portfolio audit (docs/portfolio-audit.md):
--
--   1. RLS was never enabled on 7 tables. Because the `anon` role holds full DML
--      grants by default, the public key published in the browser bundle could
--      SELECT / INSERT / UPDATE / DELETE those tables outright. The sharpest case
--      was venue_reviews, whose `approved` column defaulted to true — anyone could
--      publish an unmoderated review of any of ~530 named real businesses.
--
--   2. Four policies named "Service role full access on <table>" were created for
--      PUBLIC rather than service_role (roles={public}, USING true, WITH CHECK
--      true), which handed anon full access to the tables they were meant to
--      protect.
--
-- Safe to apply: every application writer is a server-side route using
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. The only anon-key data read on
-- the public site is approved reviews on /[slug], preserved explicitly below.
-- Owner dashboard reads go through /api/venue/* which authenticate the session
-- with the anon key and then query with the service-role key.

begin;

-- ── 1. Enable RLS where it was off (no policy == deny for anon/authenticated) ──
alter table public.venue_reviews          enable row level security;
alter table public.outreach_log           enable row level security;
alter table public.gear_clicks            enable row level security;
alter table public.outreach_optouts       enable row level security;
alter table public.venue_submissions      enable row level security;
alter table public.content_enrichment_log enable row level security;
alter table public.play_today_clicks      enable row level security;

-- ── 2. Preserve exactly one public read: approved reviews on venue pages ──
drop policy if exists venue_reviews_public_read_approved on public.venue_reviews;
create policy venue_reviews_public_read_approved
  on public.venue_reviews
  for select
  to anon, authenticated
  using (approved = true);

-- ── 3. Drop the mis-scoped "service role" policies (they granted PUBLIC) ──
drop policy if exists "Service role full access on intelligence_briefs" on public.intelligence_briefs;
drop policy if exists "Service role full access on listing_stats_daily" on public.listing_stats_daily;
drop policy if exists "Service role full access on venue_notifications" on public.venue_notifications;
drop policy if exists "Service role full access on gbp_posts_queue"     on public.gbp_posts_queue;

-- ── 4. claim_requests: /api/claim posts server-side with the service-role key,
--       so anon has no need to insert. ("Admin read claims" already USING false.)
drop policy if exists "Allow insert claims" on public.claim_requests;

-- ── 5. New review submissions must not self-approve ──
alter table public.venue_reviews alter column approved set default false;

-- ── 6. Belt and braces: revoke the underlying anon grants, so the tables are
--       closed even if a permissive policy is reintroduced later ──
revoke insert, update, delete, truncate on
  public.venue_reviews,
  public.outreach_log,
  public.gear_clicks,
  public.outreach_optouts,
  public.venue_submissions,
  public.content_enrichment_log,
  public.play_today_clicks,
  public.claim_requests,
  public.venue_notifications,
  public.intelligence_briefs,
  public.listing_stats_daily,
  public.gbp_posts_queue
from anon;

-- Anon keeps SELECT only where the public site needs it (venue_reviews, gated to
-- approved = true by the policy above). Everything else is revoked.
revoke select on
  public.outreach_log,
  public.outreach_optouts,
  public.venue_submissions,
  public.content_enrichment_log,
  public.play_today_clicks,
  public.gear_clicks,
  public.claim_requests,
  public.venue_notifications,
  public.intelligence_briefs,
  public.listing_stats_daily,
  public.gbp_posts_queue
from anon;

commit;
