'use client'

import { useState } from 'react'

export default function UpgradeButton({
  className = '',
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    // POST to checkout — the server redirects to Stripe
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/stripe/checkout'
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`btn-primary text-xs disabled:opacity-50 ${className}`}
    >
      {loading ? 'Redirecting...' : children || 'Upgrade for £29/mo →'}
    </button>
  )
}
