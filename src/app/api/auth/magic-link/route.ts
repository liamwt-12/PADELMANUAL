import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!serviceKey) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false } }
    );

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.padelmanual.com';

    // Check if they have a venue_owners row (i.e. they've claimed a venue)
    const { data: ownerRows } = await supabase
      .from('venue_owners')
      .select('email')
      .eq('email', email)
      .limit(1);
    const ownerRow = ownerRows?.[0] || null;

    if (!ownerRow) {
      return NextResponse.json(
        { error: 'No account found for this email. Find your venue and claim it first.' },
        { status: 404 }
      );
    }

    // Ensure auth user exists (may have been created during claim, or not)
    await supabase.auth.admin.createUser({ email, email_confirm: true });
    // Ignore "already registered" error — that's expected

    // Generate magic link token
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (error || !data?.properties?.hashed_token) {
      console.error('Generate link error:', error);
      return NextResponse.json({ error: 'Could not generate login link.' }, { status: 500 });
    }

    const tokenHash = data.properties.hashed_token;
    // Point at the /confirm landing page rather than the callback directly.
    // The landing page is a static GET that does not consume the OTP, so
    // email security scanners (Outlook ATP, Mimecast, Defender, etc.) can
    // pre-fetch the link without invalidating it. The actual verification
    // happens via a POST form submit on the confirm page.
    const verifyUrl = `${siteUrl}/venue/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink&next=${encodeURIComponent('/venue/dashboard')}`;

    // Send via Resend
    if (resendKey) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Padel Manual <hello@padelmanual.com>',
          to: [email],
          subject: 'Your Padel Manual dashboard link',
          text: [
            `Here's your link to sign in to your Padel Manual dashboard:`,
            ``,
            verifyUrl,
            ``,
            `This link expires in 24 hours.`,
            `If you didn't request this, you can safely ignore it.`,
            ``,
            `—`,
            `Padel Manual`,
            `padelmanual.com`,
          ].join('\n'),
        }),
      });

      if (!emailRes.ok) {
        console.error('Resend error:', await emailRes.text());
        return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Magic link error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
