import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * DEV ONLY — bypass magic link to sign in directly.
 * Requires ?secret=ADMIN_SECRET query param.
 * Remove before launch.
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret || secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = 'liamwt@hotmail.co.uk'

  // Generate a magic link token using service role
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Ensure auth user exists
  await admin.auth.admin.createUser({ email, email_confirm: true })

  // Generate token
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (error || !data?.properties?.hashed_token) {
    console.error('Dev login generate error:', error)
    return NextResponse.json({ error: 'Could not generate token' }, { status: 500 })
  }

  // Verify the token immediately to establish a session
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies) {
          cookiesToSet.push(...cookies)
        },
      },
    }
  )

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: 'magiclink',
  })

  if (verifyError) {
    console.error('Dev login verify error:', verifyError)
    return NextResponse.json({ error: 'Token verification failed', details: verifyError.message }, { status: 500 })
  }

  // Redirect to dashboard with session cookies
  const response = NextResponse.redirect(new URL('/venue/dashboard', request.url))
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options)
  }

  return response
}
