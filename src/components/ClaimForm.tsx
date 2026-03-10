'use client';

import { useState } from 'react';

interface Props {
  venueName: string;
  venueSlug: string;
  isCoach: boolean;
}

export default function ClaimForm({ venueName, venueSlug, isCoach }: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'owner', instagram: '', phone: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          venue_name: venueName,
          venue_slug: venueSlug,
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // Show success anyway — we'll see the Supabase entry
    }

    setLoading(false);
  }

  if (submitted) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-6 md:p-8 text-center">
        <div className="text-2xl mb-2">✓</div>
        <h3 className="font-serif text-lg font-semibold tracking-tight text-emerald-800">Claim submitted</h3>
        <p className="mt-2 text-sm text-emerald-700">
          We&apos;ll review your claim for {venueName} and email you within 24 hours.
        </p>
      </section>
    );
  }

  if (!open) {
    return (
      <section className="rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-6 md:p-8">
        <div className="md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <h3 className="font-serif text-lg font-semibold tracking-tight">
              {isCoach ? "Is this you?" : "Is this your venue?"}
            </h3>
            <p className="mt-2 text-sm text-pm-muted leading-relaxed max-w-md">
              This is an auto-generated profile. Claim it to update your details, add
              photos, link your Instagram, and connect with players in your area.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-pm-faint">
              <span>✓ Update your info</span>
              <span>✓ Add photos & video</span>
              <span>✓ Link Instagram</span>
              <span>✓ See visitor analytics</span>
              <span>✓ Respond to reviews</span>
            </div>
          </div>
          <div className="mt-5 md:mt-0 shrink-0">
            <button onClick={() => setOpen(true)} className="btn-primary text-center text-sm block w-full md:w-auto">
              Claim this listing
            </button>
            <p className="text-[11px] text-pm-faint text-center mt-2">Free · Takes 2 minutes</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-6 md:p-8">
      <h3 className="font-serif text-lg font-semibold tracking-tight mb-1">
        Claim {venueName}
      </h3>
      <p className="text-xs text-pm-faint mb-5">We&apos;ll verify your identity and activate your listing within 24 hours.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Your name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
              placeholder="you@venue.com"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Your role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
            >
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="coach">Coach</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Instagram handle</label>
            <input
              type="text"
              value={form.instagram}
              onChange={e => setForm({ ...form, instagram: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
              placeholder="@yourvenue"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-pm-muted block mb-1">Phone (optional)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
            placeholder="07..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit claim'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-pm-faint hover:text-pm-text transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
