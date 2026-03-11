import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip routes that handle their own auth or must be publicly accessible
  if (
    pathname.startsWith('/venue/auth/callback') ||
    pathname.startsWith('/venue/dev-login') ||
    pathname.startsWith('/venue/login')
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes — redirect to login if not authenticated
  if (!user && pathname.startsWith('/venue/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/venue/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Only run on /venue/* routes — never on API routes
    '/venue/((?!auth/callback|dev-login).*)',
  ],
}
