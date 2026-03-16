import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { product_id, product_slug } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )

    await supabase.from('gear_clicks').insert({
      product_id: product_id || null,
      product_slug: product_slug || null,
    })
  } catch {
    // fire and forget — don't fail the user experience
  }

  return NextResponse.json({ ok: true })
}
