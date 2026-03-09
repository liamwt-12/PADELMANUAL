import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Listing Demo — See What Your Page Could Look Like',
  description: 'See what a claimed and verified Padel Manual listing looks like. Photos, reviews, live availability, analytics, and more.',
};

export default function DemoListingPage() {
  return (
    <main className="pb-10">
      <section className="pb-8 pt-6">
        <a href="/find" className="text-xs text-pm-faint hover:text-pm-text transition-colors">← All venues</a>

        {/* Premium banner */}
        <div className="mt-4 rounded-xl bg-pm-text text-white px-4 py-2 inline-flex items-center gap-2 text-xs font-medium">
          <svg className="w-4 h-4 text-pm-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          Verified Premium Listing
        </div>

        <div className="label-caps mt-4">Court / Venue · London</div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">Rocket Padel Battersea</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pm-muted">
          London&apos;s most spectacular padel venue. Four panoramic courts in a glass building overlooking the River Thames at Battersea Power Station.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#" className="inline-block rounded-full bg-pm-text text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
            Book a court →
          </a>
          <a href="#" className="inline-block rounded-full border border-pm-border px-4 py-2 text-sm text-pm-muted hover:bg-pm-bg-hover transition-all">Website →</a>
          <a href="#" className="inline-block rounded-full border border-pm-border px-4 py-2 text-sm text-pm-muted hover:bg-pm-bg-hover transition-all">Instagram →</a>
        </div>
      </section>

      {/* Photo gallery */}
      <section className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
          {[
            'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
          ].map((src, i) => (
            <div key={i} className="aspect-[4/3] bg-pm-bg-card overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-pm-faint mt-1 italic">Demo photos — claimed listings show the venue&apos;s own photos</p>
      </section>

      {/* Live availability */}
      <section className="mb-6">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-pm-text">Live availability</h3>
          </div>
          <div className="space-y-1.5">
            {[
              { day: 'Today', time: '4:00pm', dur: '60min', courts: 2, price: '£50' },
              { day: 'Today', time: '5:30pm', dur: '90min', courts: 1, price: '£75' },
              { day: 'Today', time: '8:00pm', dur: '60min', courts: 3, price: '£50' },
              { day: 'Tomorrow', time: '9:00am', dur: '60min', courts: 4, price: '£45' },
              { day: 'Tomorrow', time: '11:00am', dur: '60min', courts: 2, price: '£50' },
            ].map((slot, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white border border-emerald-100/60">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{slot.day}</span>
                  <span className="text-sm font-semibold text-pm-text">{slot.time}</span>
                  <span className="text-xs text-pm-faint">{slot.dur}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-pm-muted">{slot.courts} court{slot.courts !== 1 ? 's' : ''}</span>
                  <span className="text-sm font-semibold text-pm-text">{slot.price}</span>
                </div>
              </div>
            ))}
          </div>
          <a href="#" className="mt-4 block w-full text-center rounded-full bg-emerald-600 text-white px-5 py-3 text-sm font-semibold hover:bg-emerald-700 transition-colors">
            Book on Playtomic →
          </a>
          <p className="mt-2 text-[10px] text-pm-faint text-center">Live data · Updated every 5 minutes</p>
        </div>
      </section>

      {/* Details */}
      <section className="rounded-3xl border border-pm-border/40 bg-pm-bg-card p-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Location</div>
            <div className="mt-1 font-medium">Battersea, London</div>
            <div className="text-xs text-pm-faint mt-0.5">SW11 8AL</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Courts</div>
            <div className="mt-1 font-medium">4 panoramic courts</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Setting</div>
            <div className="mt-1 font-medium">Indoor (glass)</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-faint">Price from</div>
            <div className="mt-1 font-medium">£45/hour</div>
          </div>
        </div>
        <div className="mt-8 border-t border-pm-border/40 pt-8">
          <div className="max-w-2xl text-sm leading-[1.8] text-pm-muted">
            Housed in an 11-metre-high bespoke glass building overlooking the River Thames, Rocket Padel Battersea is one of London&apos;s most striking sporting venues. Four panoramic courts offer unrivalled views of the river and Battersea Power Station.

            The venue includes a stylish clubhouse, changing rooms, a dedicated warm-up zone, a pro-shop, a comfortable lounge, a bar, and a bistro. Whether you&apos;re booking a casual session or joining one of our structured coaching programmes, every visit feels like an event.
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-6">
        <h3 className="font-serif text-xl font-semibold tracking-tight mb-4">Reviews</h3>
        <div className="space-y-3">
          {[
            { name: 'Sarah M.', rating: 5, text: 'Absolutely stunning venue. The glass courts with Thames views are something else. Booking was easy through Playtomic and the staff were welcoming. Courts in excellent condition.', date: 'Feb 2026' },
            { name: 'James K.', rating: 5, text: 'Best padel experience in London. The bistro is great for post-match food. Courts are well maintained and the coaching is top notch.', date: 'Jan 2026' },
            { name: 'Maria L.', rating: 4, text: 'Beautiful venue and great courts. Can get busy at peak times so book ahead. The lounge area is a nice touch. Would love to see more off-peak deals.', date: 'Jan 2026' },
          ].map((review, i) => (
            <div key={i} className="rounded-xl border border-pm-border/40 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-pm-bg-card border border-pm-border flex items-center justify-center text-xs font-semibold text-pm-muted">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-pm-text">{review.name}</div>
                    <div className="text-[11px] text-pm-faint">{review.date}</div>
                  </div>
                </div>
                <div className="text-sm text-pm-accent">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              </div>
              <p className="mt-3 text-sm text-pm-muted leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-pm-faint mt-2 italic">Demo reviews — claimed listings show real player reviews</p>
      </section>

      {/* Analytics preview */}
      <section className="mt-6 rounded-2xl border border-pm-border/40 bg-pm-bg-card p-6">
        <h3 className="text-sm font-semibold text-pm-text mb-4">Listing analytics (premium)</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-serif text-2xl font-bold text-pm-text">847</div>
            <div className="text-[11px] text-pm-faint">Views this month</div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-pm-text">124</div>
            <div className="text-[11px] text-pm-faint">Booking clicks</div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-pm-text">14.6%</div>
            <div className="text-[11px] text-pm-faint">Click-through rate</div>
          </div>
        </div>
        <p className="text-[11px] text-pm-faint mt-3 italic">Demo analytics — premium listings see real visitor data</p>
      </section>

      {/* CTA */}
      <section className="mt-10 rounded-2xl border-2 border-pm-accent/30 bg-pm-accent/[0.04] p-8 md:p-10 text-center">
        <div className="label-caps">This could be your listing</div>
        <h3 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
          Want your venue to look like this?
        </h3>
        <p className="mt-3 text-sm text-pm-muted max-w-md mx-auto leading-relaxed">
          Every padel venue in the UK already has a free listing on Padel Manual.
          Claim yours to add photos, respond to reviews, show live availability,
          and see how many players are finding you.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/find" className="btn-primary">
            Find your listing →
          </a>
          <a href="mailto:hello@padelmanual.com?subject=Premium listing enquiry" className="btn-secondary">
            Talk to us about premium
          </a>
        </div>
        <p className="mt-4 text-[11px] text-pm-faint">Free to claim · Premium features from £29/mo</p>
      </section>
    </main>
  );
}
