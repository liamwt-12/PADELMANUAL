import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { slug, type } = await request.json();
    if (!slug || !type) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (type === 'view') {
      await supabase.rpc('increment_view', { listing_slug: slug }).catch(() => {
        // Fallback if RPC doesn't exist
        return supabase
          .from('listings')
          .update({ 
            view_count: supabase.rpc ? undefined : 1,
            last_viewed_at: new Date().toISOString() 
          })
          .eq('slug', slug);
      });
    } else if (type === 'click') {
      await supabase.rpc('increment_click', { listing_slug: slug }).catch(() => null);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Never fail visibly
  }
}
