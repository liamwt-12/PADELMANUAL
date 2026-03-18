import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function checkAuth(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret')
    || request.headers.get('authorization')?.replace('Bearer ', '')
    || request.cookies.get('admin_secret')?.value
  return secret === process.env.ADMIN_SECRET
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  // New venues (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: newVenues } = await supabase
    .from('listings')
    .select('name, city, slug, description')
    .eq('listing_type', 'venue')
    .or('permanently_closed.is.null,permanently_closed.eq.false')
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })
    .limit(3)

  // Featured gear product
  const { data: gearProducts } = await supabase
    .from('gear_products')
    .select('name, brand, price, slug, affiliate_url, description')
    .eq('in_stock', true)
    .not('affiliate_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)

  const gear = gearProducts?.[0] || null

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  // Build plain text email
  let text = `PADEL MANUAL\n`
  text += `This week in UK padel\n`
  text += `${dateStr}\n\n`
  text += `─────────────────────────────\n\n`

  // New venues
  text += `NEW VENUES\n\n`
  if (newVenues && newVenues.length > 0) {
    for (const v of newVenues) {
      const oneLiner = v.description
        ? v.description.split(/[.!]/)[0].trim()
        : `New padel venue in ${v.city || 'the UK'}`
      text += `${v.name}, ${v.city || 'UK'} — ${oneLiner}.\n`
      text += `https://www.padelmanual.com/${v.slug}\n\n`
    }
  } else {
    text += `No new venues this week. Browse all venues:\n`
    text += `https://www.padelmanual.com/find\n\n`
  }

  text += `─────────────────────────────\n\n`

  // Gear
  if (gear) {
    text += `GEAR THIS WEEK\n\n`
    text += `${gear.name}`
    if (gear.description) {
      const oneLiner = gear.description.split(/[.!]/)[0].trim()
      text += ` — ${oneLiner}.`
    }
    if (gear.price) text += ` — £${gear.price}`
    text += `\n`
    if (gear.affiliate_url) {
      text += `Buy from Express Padel → ${gear.affiliate_url}\n`
    }
    text += `\n─────────────────────────────\n\n`
  }

  text += `Unsubscribe: {{unsubscribe_url}}\n`
  text += `padelmanual.com\n`

  // Build HTML preview
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.7; }
    .header { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #999; margin-bottom: 8px; }
    h1 { font-family: Georgia, serif; font-size: 24px; font-weight: 600; margin: 0 0 24px; }
    .label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #c17f3e; font-weight: 600; margin-bottom: 12px; }
    .venue { margin-bottom: 16px; }
    .venue a { color: #1a1a1a; text-decoration: none; font-weight: 500; }
    .venue p { color: #666; font-size: 14px; margin: 2px 0 0; }
    .divider { border: none; border-top: 1px solid #e5e5e5; margin: 28px 0; }
    .gear { font-size: 14px; }
    .gear a { color: #c17f3e; text-decoration: none; font-weight: 500; }
    .footer { font-size: 12px; color: #999; margin-top: 40px; }
    .footer a { color: #999; }
  </style>
</head>
<body>
  <div class="header">Padel Manual</div>
  <h1>This week in UK padel</h1>

  <div class="label">New venues</div>
  ${(newVenues && newVenues.length > 0) ? newVenues.map(v => {
    const oneLiner = v.description
      ? v.description.split(/[.!]/)[0].trim()
      : `New padel venue in ${v.city || 'the UK'}`
    return `<div class="venue"><a href="https://www.padelmanual.com/${v.slug}">${v.name}, ${v.city || 'UK'}</a><p>${oneLiner}.</p></div>`
  }).join('\n  ') : '<p style="color:#666;font-size:14px;">No new venues this week.</p>'}

  <hr class="divider">

  ${gear ? `
  <div class="label">Gear this week</div>
  <div class="gear">
    <strong>${gear.name}</strong>${gear.description ? ` — ${gear.description.split(/[.!]/)[0].trim()}.` : ''}${gear.price ? ` — £${gear.price}` : ''}<br>
    ${gear.affiliate_url ? `<a href="${gear.affiliate_url}">Buy from Express Padel →</a>` : ''}
  </div>

  <hr class="divider">
  ` : ''}

  <div class="footer">
    <a href="{{unsubscribe_url}}">Unsubscribe</a> · <a href="https://www.padelmanual.com">padelmanual.com</a>
  </div>
</body>
</html>`

  // Return HTML preview by default, text with ?format=text
  const format = request.nextUrl.searchParams.get('format')
  if (format === 'text') {
    return new Response(text, { headers: { 'Content-Type': 'text/plain' } })
  }

  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}
