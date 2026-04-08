import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type AuthInputs = {
  code: string | null
  token_hash: string | null
  type: 'magiclink' | 'signup' | 'recovery' | 'email' | 'invite' | 'email_change' | null
  next: string
}

async function handleAuth(request: NextRequest, inputs: AuthInputs) {
  const { code, token_hash, type, next } = inputs

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

  let authError: { message: string } | null = null

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) authError = { message: error.message }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (error) authError = { message: error.message }
  } else {
    authError = { message: 'No code or token_hash provided' }
  }

  if (authError) {
    console.error('Auth callback error:', authError.message)
    console.error('Params — code:', !!code, 'token_hash:', !!token_hash, 'type:', type)
    return NextResponse.redirect(new URL('/venue/login?error=auth', request.url))
  }

  // Force a session read so any pending cookie writes are flushed before we
  // build the redirect response. Without this, the SIGNED_IN listener and
  // its setAll callback can race the response in some Node.js runtimes.
  await supabase.auth.getUser()

  // Redirect to dashboard and explicitly attach session cookies to the response.
  const response = NextResponse.redirect(new URL(next, request.url))
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options)
  }

  return response
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  return handleAuth(request, {
    code: searchParams.get('code'),
    token_hash: searchParams.get('token_hash'),
    type: searchParams.get('type') as AuthInputs['type'],
    next: searchParams.get('next') ?? '/venue/dashboard',
  })
}

export async function POST(request: NextRequest) {
  // Magic-link confirm form submits here. POST avoids email security
  // scanners (Outlook ATP, Mimecast, Defender etc.) pre-fetching the
  // verification link and consuming the one-time token.
  const formData = await request.formData()
  return handleAuth(request, {
    code: (formData.get('code') as string | null) ?? null,
    token_hash: (formData.get('token_hash') as string | null) ?? null,
    type: (formData.get('type') as AuthInputs['type']) ?? null,
    next: ((formData.get('next') as string | null) ?? '/venue/dashboard'),
  })
}
