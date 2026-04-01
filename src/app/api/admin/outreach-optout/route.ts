import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function checkAuth(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret')
    || request.headers.get('authorization')?.replace('Bearer ', '')
    || request.cookies.get('admin_secret')?.value
  return secret === process.env.ADMIN_SECRET
}

/**
 * POST /api/admin/outreach-optout
 * Body: { email, listing_id?, outreach_log_id?, reason? }
 *
 * Inserts into outreach_optouts, nulls email on listings, marks sequence complete.
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { email, listing_id, outreach_log_id, reason } = body

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const emailLower = email.toLowerCase()
  const supabase = getSupabaseAdmin()

  // Insert opt-out record (ignore conflict if already opted out)
  const { error: optoutError } = await supabase
    .from('outreach_optouts')
    .upsert(
      { email: emailLower, listing_id: listing_id || null, reason: reason || 'Manual admin opt-out' },
      { onConflict: 'email' },
    )

  if (optoutError) {
    return NextResponse.json({ error: optoutError.message }, { status: 500 })
  }

  // Null out email on the listing so it doesn't get re-scraped into outreach
  if (listing_id) {
    await supabase
      .from('listings')
      .update({ email: null })
      .eq('id', listing_id)
  }

  // Mark the outreach_log entry as sequence complete
  if (outreach_log_id) {
    await supabase
      .from('outreach_log')
      .update({ sequence_completed: true })
      .eq('id', outreach_log_id)
  }

  // Also mark any other outreach_log entries for this email as complete (case-insensitive)
  await supabase
    .from('outreach_log')
    .update({ sequence_completed: true })
    .ilike('email', emailLower)
    .eq('type', 'outreach')
    .eq('sequence_completed', false)

  return NextResponse.json({ ok: true })
}
