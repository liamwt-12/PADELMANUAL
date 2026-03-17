import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const email = request.cookies.get('pm_impersonate')?.value
  if (email) {
    return NextResponse.json({ isImpersonating: true, email })
  }
  return NextResponse.json({ isImpersonating: false, email: null })
}
