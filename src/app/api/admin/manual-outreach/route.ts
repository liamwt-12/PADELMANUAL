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

/** GET /api/admin/manual-outreach?q=rocket — search venues by name */
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ venues: [] })
  }

  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('listings')
    .select('id, name, city, email, manually_outreached_at')
    .ilike('name', `%${q}%`)
    .order('name')
    .limit(10)

  return NextResponse.json({ venues: data || [] })
}

/** POST /api/admin/manual-outreach { listing_id } — set manually_outreached_at */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { listing_id } = await request.json()
  if (!listing_id) {
    return NextResponse.json({ error: 'listing_id required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('listings')
    .update({ manually_outreached_at: new Date().toISOString() })
    .eq('id', listing_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
