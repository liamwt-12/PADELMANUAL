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
      className={`rounded-full bg-[#c4956a] text-white px-6 py-3 text-sm font-semibold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50 w-full sm:w-auto text-center ${className}`}
    >
      {loading ? 'Redirecting...' : children || 'Upgrade for £29/mo →'}
    </button>
  )
}
