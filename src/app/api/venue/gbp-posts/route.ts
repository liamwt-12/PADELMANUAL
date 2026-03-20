import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { refreshAccessToken } from '@/lib/gbp'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const listingId = request.nextUrl.searchParams.get('listing_id')
  if (!listingId) {
    return NextResponse.json({ error: 'listing_id required' }, { status: 400 })
  }

  const { data: posts } = await supabase
    .from('gbp_posts_queue')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ posts: posts || [] })
}

// Approve/reject/post a GBP post
export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { post_id, action, post_text } = await request.json()
  if (!post_id || !action) {
    return NextResponse.json({ error: 'post_id and action required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  if (action === 'reject') {
    await supabase
      .from('gbp_posts_queue')
      .update({ status: 'rejected' })
      .eq('id', post_id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'edit') {
    await supabase
      .from('gbp_posts_queue')
      .update({ post_text })
      .eq('id', post_id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'approve') {
    // Get the post
    const { data: post } = await supabase
      .from('gbp_posts_queue')
      .select('*, listing_id')
      .eq('id', post_id)
      .single()

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    // Get owner GBP credentials
    const { data: owners } = await supabase
      .from('venue_owners')
      .select('gbp_access_token, gbp_refresh_token, gbp_account_id, gbp_location_id')
      .eq('email', user.email)
      .eq('listing_id', post.listing_id)
      .limit(1)

    const owner = owners?.[0]
    if (!owner?.gbp_refresh_token || !owner?.gbp_location_id || !owner?.gbp_account_id) {
      // Just mark as approved without posting
      await supabase
        .from('gbp_posts_queue')
        .update({ status: 'approved' })
        .eq('id', post_id)
      return NextResponse.json({ ok: true, posted: false })
    }

    // Refresh token and post to Google
    try {
      const refreshed = await refreshAccessToken(owner.gbp_refresh_token)
      const accessToken = refreshed.access_token

      const gbpRes = await fetch(
        `https://mybusiness.googleapis.com/v4/${owner.gbp_account_id}/${owner.gbp_location_id}/localPosts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            languageCode: 'en-GB',
            summary: post.post_text,
            topicType: post.post_type || 'STANDARD',
          }),
        }
      )

      if (gbpRes.ok) {
        const gbpData = await gbpRes.json()
        await supabase
          .from('gbp_posts_queue')
          .update({
            status: 'posted',
            posted_at: new Date().toISOString(),
            google_post_id: gbpData.name || null,
          })
          .eq('id', post_id)
        return NextResponse.json({ ok: true, posted: true })
      } else {
        console.error('GBP post failed:', await gbpRes.text())
        await supabase
          .from('gbp_posts_queue')
          .update({ status: 'approved' })
          .eq('id', post_id)
        return NextResponse.json({ ok: true, posted: false })
      }
    } catch (err) {
      console.error('GBP post error:', err)
      await supabase
        .from('gbp_posts_queue')
        .update({ status: 'approved' })
        .eq('id', post_id)
      return NextResponse.json({ ok: true, posted: false })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
