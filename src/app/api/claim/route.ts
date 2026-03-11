import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, venue_name, venue_slug, instagram, phone } = body;

    if (!name || !email || !venue_slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    // 1. Store claim request (existing behaviour)
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

    // 2. Look up listing to get its ID
    const { data: listing } = await supabase
      .from('listings')
      .select('id')
      .eq('slug', venue_slug)
      .single();

    // 3. Create venue_owners row (upsert by email)
    if (listing) {
      const { error: ownerError } = await supabase
        .from('venue_owners')
        .upsert(
          {
            email,
            name,
            listing_id: listing.id,
            subscription_status: 'free',
          },
          { onConflict: 'email' }
        );

      if (ownerError) {
        console.error('Venue owner upsert error:', ownerError);
      }

      // Mark listing as claimed
      await supabase
        .from('listings')
        .update({ claimed: true })
        .eq('id', listing.id);
    }

    // 4. Create auth user + generate magic link (if service role key available)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padelmanual.com';
    let magicLink: string | null = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Create auth user (ignore error if already exists)
      const { error: createUserError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (createUserError && !createUserError.message.includes('already been registered')) {
        console.error('Create user error:', createUserError);
      }

      // Generate magic link
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: `${siteUrl}/venue/auth/callback`,
        },
      });

      if (linkError) {
        console.error('Generate link error:', linkError);
      } else if (linkData?.properties?.action_link) {
        magicLink = linkData.properties.action_link;
      }
    }

    // 5. Send emails via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      // Notify admin
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

      // Auto-reply with magic link (if generated) or login link
      const dashboardLine = magicLink
        ? `\nYour dashboard is ready. Click the link below to sign in:\n${magicLink}\n\nThis link expires in 24 hours. You can always request a new one at:\n${siteUrl}/venue/login\n`
        : `\nYou can sign in to your venue dashboard at:\n${siteUrl}/venue/login\n`;

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
          text: `Hi ${name},\n\nThanks for claiming ${venue_name} on Padel Manual.\n${dashboardLine}\nYou can see your current listing here:\nhttps://www.padelmanual.com/${venue_slug}\n\nBest,\nPadel Manual\npadelmanual.com`,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Claim error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
