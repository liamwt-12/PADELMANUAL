const SITE_URL = 'https://www.padelmanual.com'

export function outreachEmail({
  venueName,
  viewCount,
  claimSlug,
}: {
  venueName: string
  viewCount: number
  claimSlug: string
}) {
  return {
    subject: `Someone tried to contact ${venueName} through Padel Manual`,
    text: `Hi,

Someone found ${venueName} on Padel Manual this week and tried to get in touch.

We held onto their details — but we couldn't pass them on because the listing isn't claimed yet.

Padel Manual is the UK's padel venue directory. Your venue is already listed — ${viewCount.toLocaleString()} players have viewed it. Claim it in about 2 minutes and we'll send you any future enquiries directly.

It's free to claim. The full dashboard (analytics, leads, Google insights) is £29/mo — about the cost of one extra booking.

Claim your listing here:
${SITE_URL}/${claimSlug}

—
Liam
Padel Manual
padelmanual.com`,
  }
}

export function featuredTrialEmail({
  venueName,
}: {
  venueName: string
}) {
  return {
    subject: `We've featured ${venueName} on Padel Manual this week`,
    text: `Hi,

We've picked ${venueName} as this week's featured venue on Padel Manual.

Your listing has been upgraded to our full dashboard for 7 days, free. You'll get:
- Live analytics (how many players are viewing and clicking)
- Player leads direct to your inbox
- Court utilisation data from Playtomic
- Google Business Profile insights

Have a look at your dashboard here:
${SITE_URL}/venue/login

We'll send you a summary of what happened at the end of the week.

—
Liam
Padel Manual
padelmanual.com`,
  }
}

export function trialFollowupEmail({
  venueName,
  viewCount,
  clickCount,
  leadCount,
}: {
  venueName: string
  viewCount: number
  clickCount: number
  leadCount: number
}) {
  return {
    subject: `Your featured week on Padel Manual — here's what happened`,
    text: `Hi,

Your featured week ends tomorrow. Here's what happened:

${venueName} on Padel Manual this week:
- Listing views: ${viewCount}
- Booking clicks: ${clickCount}
- Player leads: ${leadCount}

Your listing goes back to the free plan tomorrow.

To keep everything — analytics, leads, Google insights — it's £29/mo. Most venues that try the dashboard stay on it.

Keep the dashboard:
${SITE_URL}/venue/login

No pressure either way.

—
Liam
Padel Manual
padelmanual.com`,
  }
}
