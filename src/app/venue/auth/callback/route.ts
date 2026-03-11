import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'magiclink' | 'signup' | 'recovery' | null
  const next = searchParams.get('next') ?? '/venue/dashboard'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  let authError = null

  if (code) {
    // PKCE flow — exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    authError = error
  } else if (token_hash && type) {
    // Email link flow — verify OTP directly
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    authError = error
  } else {
    authError = { message: 'No code or token_hash provided' }
  }

  if (!authError) {
    return NextResponse.redirect(new URL(next, request.url))
  }

  console.error('Auth callback error:', authError)
  return NextResponse.redirect(new URL('/venue/login?error=auth', request.url))
}
