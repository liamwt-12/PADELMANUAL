# Mothball comms — drafts for sign-off

**Status: DRAFTS. Nothing has been sent.** Send from `hello@padelmanual.com` (Zoho) yourself.

Prepared 28 July 2026 alongside the mothball work in `docs/portfolio-audit.md`.

---

## Part A — Claim request replies

10 claim requests, all still `status: pending`, the oldest 133 days old. They come from
**5 distinct people** — Kieran Coleman submitted 6 (one per Playtime Padel site), so one
email covers all six rather than sending him the same message six times.

After sending, mark the rows actioned:

```sql
update claim_requests set status = 'closed_mothballed' where status = 'pending';
```

---

### A1 — Duncan Maclay · East Grinstead Padel Centre
**To:** play@eastgrinsteadpadel.com
**Subject:** Your Padel Manual listing — an overdue reply

> Hi Duncan,
>
> You asked to claim the East Grinstead Padel Centre listing on Padel Manual back in March.
> You never got a reply, and that is entirely on me — I am sorry.
>
> The short version: I have paused the venue owner dashboard. It was not getting the
> attention it needed, and running it half-heartedly was worse than not running it.
>
> What this means for you:
>
> - Your listing stays live, free, exactly as it is. Nothing is being removed.
> - If anything on it is wrong, reply to this email and I will fix it myself.
> - If the dashboard reopens, you are first on the list and I will get in touch.
>
> Thanks for taking the time back in March, and sorry again for the silence.
>
> Liam
> Padel Manual · hello@padelmanual.com

---

### A2 — Kieran Coleman · Playtime Padel (6 sites)
**To:** info@playtimepadel.com
**Subject:** Your six Padel Manual listings — an overdue reply

*Covers claim requests for Kingston, Battersea, Fulham, Tooting, Tolworth and Tower Hamlets.*

> Hi Kieran,
>
> Back in March you claimed all six Playtime Padel listings on Padel Manual — Kingston,
> Battersea, Fulham, Tooting, Tolworth and Tower Hamlets. You never got a reply to any of
> them, which is not good enough. I am sorry.
>
> I have since paused the venue owner dashboard. It was not getting the attention it
> needed, and running it half-heartedly was worse than not running it at all.
>
> What this means for you:
>
> - All six listings stay live, free, exactly as they are. Nothing is being removed.
> - If any details are wrong across the six, reply here and I will correct them myself.
> - If the dashboard reopens, you are first on the list and I will get in touch.
>
> Thanks for the time you put in back in March, and sorry for the silence since.
>
> Liam
> Padel Manual · hello@padelmanual.com

---

### A3 — Kerem Karacayli · Grace Dieu Padel
**To:** info@gracedieupadel.com
**Subject:** Your Padel Manual listing — an overdue reply

> Hi Kerem,
>
> You asked to claim the Grace Dieu Padel listing on Padel Manual in March and never heard
> back. I am sorry — that one is on me.
>
> I have paused the venue owner dashboard. It was not getting the attention it needed, and
> running it half-heartedly was worse than not running it.
>
> What this means for you:
>
> - Your listing stays live, free, exactly as it is.
> - If anything on it is wrong, reply to this email and I will fix it myself.
> - If the dashboard reopens, you are first on the list and I will get in touch.
>
> Sorry again for the silence.
>
> Liam
> Padel Manual · hello@padelmanual.com

---

### A4 — Ellie · Epping Golf Course
**To:** Manager@eppinggolfcourse.org.uk
**Subject:** Your Padel Manual listing — an overdue reply

> Hi Ellie,
>
> You asked to claim the Epping Golf Course listing on Padel Manual in April. You never got
> a reply, and I am sorry about that.
>
> I have paused the venue owner dashboard — it was not getting the attention it needed, and
> running it half-heartedly was worse than not running it.
>
> What this means for you:
>
> - Your listing stays live, free, exactly as it is.
> - If anything on it is wrong, reply to this email and I will fix it myself.
> - If the dashboard reopens, you are first on the list and I will get in touch.
>
> Sorry again for the wait.
>
> Liam
> Padel Manual · hello@padelmanual.com

---

### A5 — Tom Seabridge · The Padel Den, Elworth Cricket Club
**To:** tom.seabridge@gmail.com
**Subject:** Your Padel Manual listing — an overdue reply

> Hi Tom,
>
> You asked to claim The Padel Den (Elworth Cricket Club) on Padel Manual in April and never
> heard back. Sorry — that is on me.
>
> I have paused the venue owner dashboard. It was not getting the attention it needed, and
> running it half-heartedly was worse than not running it.
>
> What this means for you:
>
> - Your listing stays live, free, exactly as it is.
> - If anything on it is wrong, reply to this email and I will fix it myself.
> - If the dashboard reopens, you are first on the list and I will get in touch.
>
> Sorry again for the silence.
>
> Liam
> Padel Manual · hello@padelmanual.com

---

## Part B — Player leads

### ⚠️ Read this first: only 1 of the 7 can actually be forwarded

The brief was to pass each lead to its venue's real contact email. **Six of the seven venues
have no usable email address**, which is exactly why these enquiries went nowhere in the
first place:

| Lead | Venue | Venue contact on file | Forwardable? |
|---|---|---|---|
| Allan McDonald (21 May) | Pukka Padel Kidderminster | `user@domain.com` — a placeholder published on the venue's own website, which our scraper copied. Real address found: **admin@padelandplay.co.uk** | **Yes** |
| Barry Jessup (16 May) | Strategic Padel, Uckfield | none — no email, no phone, Playtomic page only | No |
| Nicki Boughton (28 May) | Strategic Padel, Uckfield | none | No |
| Leanne (16 Jul) | Jaxx Padel, Llansamlet | none — no email, no phone, Playtomic page only | No |
| John Porter (17 Jul) | Gatwick Padel, Copthorne | phone only (+44 7594 174730). The `website_url` on the listing points at padelhub.uk, which does not mention Gatwick or Copthorne — mis-scraped | No |
| Martyn (24 Jul) | Gatwick Padel | as above | No |
| Shlok Chaudhary (24 Jul) | Gatwick Padel | as above | No |

So Part B is split: **B1** is the one real forward, and **B2** is a reply to each player.
Four of these enquiries are over two months old; a stale lead is worth little to the venue,
but the person who asked is still owed an answer and an honest explanation. That felt like
the better use of the drafts than six emails to addresses that do not exist.

After sending, mark them actioned:

```sql
update listing_leads set contacted = true where contacted = false;
```

---

### B1 — The one forward

**To:** admin@padelandplay.co.uk
**Subject:** Player enquiry for Pukka Padel Kidderminster (via Padel Manual)

> Hello,
>
> Padel Manual lists Pukka Padel Kidderminster, and a player sent this enquiry through your
> listing on 21 May. It did not reach you at the time — the contact address we had on file
> was a placeholder — so I am passing it on now, late, with apologies.
>
> ---
> **From:** Allan McDonald — allanmc70@icloud.com
> **Interest:** Membership
>
> "Hi, My mate and I are interested in lessons, membership etc. would you be able to provide
> some information please? Many thanks, Allan"
> ---
>
> Allan is best contacted directly on the address above. I have written to him separately to
> explain the delay.
>
> One other thing worth knowing: the contact address shown on padelandplay.co.uk reads
> `user@domain.com`, which looks like placeholder text that was never replaced. Anyone
> emailing you from the site will be bouncing.
>
> Your Padel Manual listing stays live and free, and needs nothing from you.
>
> Liam
> Padel Manual · hello@padelmanual.com

---

### B2 — Replies to the players

**Common footer for all six:**

> Sorry again for the delay,
> Liam
> Padel Manual · hello@padelmanual.com

---

**B2.1 — Allan McDonald** (also covered by the forward above)
**To:** allanmc70@icloud.com
**Subject:** Your Pukka Padel enquiry — sorry for the delay

> Hi Allan,
>
> In May you asked Pukka Padel Kidderminster about lessons and membership through Padel
> Manual. That message did not reach them — the contact address we held was a placeholder —
> and it has taken me far too long to notice. Sorry.
>
> I have now forwarded your enquiry to them at admin@padelandplay.co.uk. If you would rather
> not wait, they are on **01905 671605**, and you can see courts and times on their
> Playtomic page: https://playtomic.com/clubs/pukkaa-padel-kidderminster

---

**B2.2 — Barry Jessup**
**To:** Barry.jessup@socius.dev
**Subject:** Your Strategic Padel enquiry — sorry for the delay

> Hi Barry,
>
> Back in May you asked Strategic Padel about membership, court booking and social games
> through Padel Manual. I am sorry to say that message never got to them, and it has taken
> me until now to spot it.
>
> I do not hold a working email or phone number for Strategic Padel, so I cannot pass it on
> for you. The most reliable route is their booking page, which shows courts and times and
> lets you contact the club directly:
> https://playtomic.com/clubs/strategic-padel
>
> If you have already sorted a regular game since May, ignore me entirely — and I hope you
> found one.

---

**B2.3 — Nicki Boughton**
**To:** nickiboughton@gmail.com
**Subject:** Your Strategic Padel enquiry — sorry for the delay

> Hi Nicki,
>
> In May you asked Strategic Padel through Padel Manual whether they run beginner classes
> for the over-60s. That message never reached them, and I have only just caught it. I am
> sorry — that is a fair question that deserved an answer months ago.
>
> I do not hold a working email or phone number for Strategic Padel, so I cannot forward it.
> Their booking page is the best way to reach the club directly:
> https://playtomic.com/clubs/strategic-padel
>
> For what it is worth, most UK clubs do run beginner sessions even when they are not
> advertised, so it is worth asking.

---

**B2.4 — Leanne**
**To:** jonsey76@hotmail.co.uk
**Subject:** Your message to Jaxx Padel — sorry for the delay

> Hi Leanne,
>
> On 16 July you sent a message through Padel Manual asking whether the Jaxx Padel café does
> takeaway sandwiches for your team next door at Parcelforce. It did not reach them, and I
> am sorry for the wait.
>
> Padel Manual is a directory of padel venues, and I do not hold an email or phone number for
> Jaxx Padel, so I cannot pass it on. Their booking page is the most direct route to the
> club:
> https://playtomic.com/clubs/jaxx-padel
>
> Popping in is probably quicker than any of this, given you are next door.

---

**B2.5 — John Porter**
**To:** manutd2411@hotmail.co.uk
**Subject:** Your Gatwick Padel enquiry — sorry for the delay

> Hi John,
>
> On 17 July you asked Gatwick Padel about court hire prices through Padel Manual. That
> message did not reach them and I am sorry for the delay.
>
> The best number I have for Gatwick Padel is **07594 174730**. Their booking page shows
> courts, times and prices:
> https://playtomic.com/clubs/gatwick-padel
>
> I do not hold an email address for them, or I would have forwarded this for you.

---

**B2.6 — Martyn**
**To:** newtonmartyn@gmail.com
**Subject:** Your Gatwick Padel enquiry — sorry for the delay

> Hi Martyn,
>
> On 24 July you asked Gatwick Padel about court costs and whether you need a membership.
> That message did not reach them — sorry.
>
> The best number I have for them is **07594 174730**, and their booking page shows current
> court prices, including non-member rates:
> https://playtomic.com/clubs/gatwick-padel

---

**B2.7 — Shlok Chaudhary**
**To:** shlok.vin@gmail.com
**Subject:** Your Gatwick Padel enquiry — sorry for the delay

> Hi Shlok,
>
> On 24 July you asked through Padel Manual whether Gatwick Padel hires out rackets or
> whether you need to bring your own. That message did not reach them — sorry for the wait.
>
> Most UK clubs do hire rackets, usually a few pounds a session, but I would not want you to
> turn up on my word alone. Gatwick Padel are on **07594 174730**, and their booking page is
> here:
> https://playtomic.com/clubs/gatwick-padel

---

## Send checklist

- [ ] A1 Duncan Maclay
- [ ] A2 Kieran Coleman (covers 6 claim requests)
- [ ] A3 Kerem Karacayli
- [ ] A4 Ellie, Epping Golf Course
- [ ] A5 Tom Seabridge
- [ ] B1 Pukka Padel Kidderminster (the forward)
- [ ] B2.1–B2.7 player replies
- [ ] Run the two SQL statements above to close out `claim_requests` and `listing_leads`
