const SITE_URL = 'https://www.padelmanual.com'
const CLAIM_URL = (slug: string) => `${SITE_URL}/claim?venue=${slug}`

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
padelmanual.com

PS. If this isn't relevant to you, just reply and I'll remove you from future emails.`,
  }
}

export function outreachStep2Email({ venueName, claimSlug }: { venueName: string; claimSlug: string }) {
  return {
    subject: `Re: ${venueName} on Padel Manual`,
    text: `Hi,

Quick one — I can see ${venueName} has a Google Business Profile. Once you claim your listing on Padel Manual you can connect it and see exactly how many players are searching for you on Google each month — searches, calls, directions, all in one place.

Takes 2 minutes to set up:
${CLAIM_URL(claimSlug)}

—
Liam
Padel Manual
padelmanual.com

PS. If this isn't relevant to you, just reply and I'll remove you from future emails.`,
  }
}

export function outreachStep3Email({ venueName }: { venueName: string }) {
  return {
    subject: `Re: ${venueName} on Padel Manual`,
    text: `Hi,

Just checking my last couple of emails landed okay — happy to answer anything about Padel Manual if useful.

—
Liam
Padel Manual
padelmanual.com

PS. If this isn't relevant to you, just reply and I'll remove you from future emails.`,
  }
}

export function outreachStep4Email({ venueName, claimSlug }: { venueName: string; claimSlug: string }) {
  return {
    subject: `Re: ${venueName} on Padel Manual`,
    text: `Hi,

Last one from me. ${venueName} stays listed on Padel Manual either way — players will keep finding you.

If you ever want to claim it and see your Google data, it's here:
${CLAIM_URL(claimSlug)}

—
Liam
Padel Manual
padelmanual.com`,
  }
}

export function welcomeEmail({ name, venueName, venueSlug, magicLink }: { name: string; venueName: string; venueSlug: string; magicLink: string | null }) {
  const dashboardLink = magicLink || `${SITE_URL}/venue/login`

  return {
    subject: `Welcome to Padel Manual — ${venueName} is yours`,
    text: `Hi ${name},

${venueName} is now claimed on Padel Manual. You're in control of how players see your venue.

Here's what you can do from your dashboard:

1. Update your listing — add photos, opening hours, announcements
2. See who's finding you — views, clicks, and player enquiries
3. Connect Google Business Profile — see how players search for you on Google
4. Receive leads — players can contact you directly through your listing

Sign in here:
${dashboardLink}

Your listing is live at:
${SITE_URL}/${venueSlug}

The free plan gives you full editing control. The premium dashboard (£29/mo) adds analytics, Google insights, and lead management — but there's no rush. Have a look around first.

If you need anything, just reply to this email.

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
