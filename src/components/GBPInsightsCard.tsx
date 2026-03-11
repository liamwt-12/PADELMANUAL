'use client'

import { useEffect, useState } from 'react'

type Insights = {
  searches: number
  directions: number
  calls: number
  websiteClicks: number
  period: string
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-bold tracking-tight">{value.toLocaleString()}</p>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">{label}</p>
    </div>
  )
}

export default function GBPInsightsCard() {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/gbp/insights')
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => setInsights(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6 h-full">
        <p className="label-caps mb-3">Google Business Profile</p>
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-pm-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !insights) {
    return (
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6 h-full">
        <p className="label-caps mb-3">Google Business Profile</p>
        <p className="text-sm text-pm-muted">Could not load Google data.</p>
        <p className="text-xs text-pm-faint mt-1">Try disconnecting and reconnecting in Settings.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="label-caps">Google Business Profile</p>
        <span className="flex items-center gap-1 text-[10px] text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Connected
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        <Metric label="Searches" value={insights.searches} />
        <Metric label="Directions" value={insights.directions} />
        <Metric label="Calls" value={insights.calls} />
        <Metric label="Website clicks" value={insights.websiteClicks} />
      </div>

      <p className="text-[10px] text-pm-faint text-center mt-4">{insights.period}</p>
    </div>
  )
}
