import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, venue_name, venue_slug, instagram, phone } = body;

    if (!name || !email || !venue_slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Store in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: insertError } = await supabase
      .from('claim_requests')
      .insert({
        name,
        email,
        role: role || 'owner',
        venue_name: venue_name || '',
        venue_slug,
        instagram: instagram || null,
        phone: phone || null,
        status: 'pending',
      });

    if (insertError) {
      console.error('Claim insert error:', insertError);
    }

    // Send notification email via Resend (if key is set)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Padel Manual <hello@padelmanual.com>',
          to: ['hello@padelmanual.com'],
          subject: `New claim request: ${venue_name}`,
          text: `New claim request:\n\nVenue: ${venue_name}\nSlug: ${venue_slug}\nName: ${name}\nEmail: ${email}\nRole: ${role}\nInstagram: ${instagram || 'Not provided'}\nPhone: ${phone || 'Not provided'}\n\nLink: https://www.padelmanual.com/${venue_slug}`,
        }),
      });

      // Auto-reply to the claimer
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Padel Manual <hello@padelmanual.com>',
          to: [email],
          subject: `Your claim for ${venue_name} on Padel Manual`,
          text: `Hi ${name},\n\nThanks for claiming ${venue_name} on Padel Manual.\n\nWe'll review your request and get back to you within 24 hours with next steps.\n\nIn the meantime, you can see your current listing here:\nhttps://www.padelmanual.com/${venue_slug}\n\nBest,\nPadel Manual\npadelmanual.com`,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Claim error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
