import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { slug, type } = await request.json();
    if (!slug || !type) return NextResponse.json({ ok: false }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (type === 'view') {
      await supabase.rpc('increment_view', { listing_slug: slug });
    } else if (type === 'click') {
      await supabase.rpc('increment_click', { listing_slug: slug });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
