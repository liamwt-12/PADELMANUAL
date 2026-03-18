'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="rounded-3xl bg-pm-text p-8 md:p-10">
      <div className="label-caps !text-pm-accent">The Weekly Note</div>
      <h3 className="mt-3 font-serif text-xl font-semibold text-pm-bg">
        Stay ahead of the game.
      </h3>
      <p className="mt-2 text-sm text-pm-faint max-w-md">
        New courts, gear reviews, and the best courts near you. Weekly. Free.
      </p>
      {status === 'success' ? (
        <p className="mt-5 text-sm text-emerald-400 flex items-center gap-1.5">
          <span>&#10003;</span> You&apos;re in. First issue lands Monday.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 max-w-sm">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-pm-accent/40"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-full bg-pm-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe →'}
            </button>
          </div>
          {status === 'error' && (
            <p className="mt-2 text-xs text-red-400">Something went wrong — try again.</p>
          )}
        </form>
      )}
    </div>
  )
}
