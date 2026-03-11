'use client'

import { useState } from 'react'

export default function ManageBillingButton({ className = '' }: { className?: string }) {
  const [loading, setLoading] = useState(false)

  function handleClick() {
    setLoading(true)
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/stripe/portal'
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`btn-secondary text-xs disabled:opacity-50 ${className}`}
    >
      {loading ? 'Loading...' : 'Manage billing →'}
    </button>
  )
}
