'use client'

import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="py-20 text-center">
        <div className="mx-auto max-w-sm">
          <div className="w-12 h-12 rounded-full bg-pm-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-pm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="mt-3 text-sm text-pm-muted leading-relaxed">
            We&apos;ve sent a login link to <strong className="text-pm-text">{email}</strong>.
            Click the link to access your dashboard.
          </p>
          <p className="mt-6 text-xs text-pm-faint">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button onClick={() => setSent(false)} className="text-pm-accent hover:underline">
              try again
            </button>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="py-20">
      <div className="mx-auto max-w-sm">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-center">Venue Dashboard</h1>
        <p className="mt-2 text-sm text-pm-muted text-center">
          Sign in to manage your listing on Padel Manual.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-[11px] font-medium text-pm-muted block mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
              placeholder="you@venue.com"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send login link'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-pm-faint">
          Don&apos;t have a listing yet?{' '}
          <a href="/find" className="text-pm-accent hover:underline">Find your venue</a>
          {' '}and claim it for free.
        </p>
      </div>
    </main>
  )
}
