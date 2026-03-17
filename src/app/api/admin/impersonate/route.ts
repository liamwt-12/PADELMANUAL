import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const adminSecret = request.cookies.get('admin_secret')?.value
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email } = await request.json()
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('pm_impersonate', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  })
  return res
}
