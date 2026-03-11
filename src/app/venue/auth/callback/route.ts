import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'magiclink' | 'signup' | 'recovery' | null
  const next = searchParams.get('next') ?? '/venue/dashboard'

  // Accumulate cookies so we can apply them to the final redirect response
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

  let authError = null

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    authError = error
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    authError = error
  } else {
    authError = { message: 'No code or token_hash provided' }
  }

  if (authError) {
    console.error('Auth callback error:', JSON.stringify(authError))
    console.error('Params — code:', !!code, 'token_hash:', !!token_hash, 'type:', type)
    return NextResponse.redirect(new URL('/venue/login?error=auth', request.url))
  }

  // Redirect to dashboard and explicitly attach session cookies to the response
  const response = NextResponse.redirect(new URL(next, request.url))
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options)
  }

  return response
}
