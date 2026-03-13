'use client'

import { useEffect, useState } from 'react'

interface Props {
  tenantId: string
  totalCourts: number
}

type DayUtil = {
  day: string
  label: string
  totalSlots: number
  bookedSlots: number
  pct: number
}

export default function CourtUtilisationCard({ tenantId, totalCourts }: Props) {
  const [days, setDays] = useState<DayUtil[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchUtilisation()
  }, [tenantId])

  async function fetchUtilisation() {
    try {
      const res = await fetch(`/api/utilisation?tenant_id=${tenantId}&courts=${totalCourts}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDays(data.days || [])
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  if (error) return null

  if (loading) {
    return (
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-8">
        <p className="text-xs text-pm-faint mb-4">Loading utilisation data...</p>
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-pm-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (days.length === 0) return null

  const avgPct = Math.round(days.reduce((sum, d) => sum + d.pct, 0) / days.length)

  return (
    <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-8">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] text-pm-faint">Next 7 days</span>
      </div>

      <div className="sm:flex sm:items-end sm:gap-10">
        {/* Average */}
        <div className="mb-6 sm:mb-0 sm:shrink-0">
          <p className="font-serif text-5xl font-bold tracking-tight text-pm-text">{avgPct}%</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-1">Avg booked</p>
        </div>

        {/* Daily bars */}
        <div className="flex items-end gap-2 h-24 flex-1">
          {days.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full bg-pm-bg-hover rounded overflow-hidden" style={{ height: '72px' }}>
                <div
                  className="w-full rounded transition-all duration-500"
                  style={{
                    height: `${d.pct}%`,
                    marginTop: `${100 - d.pct}%`,
                    backgroundColor: d.pct > 80 ? '#059669' : d.pct > 50 ? '#c4956a' : '#d6d3cd',
                  }}
                />
              </div>
              <span className="text-[9px] text-pm-faint font-medium">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-[10px] text-pm-faint">
        Based on Playtomic availability · {totalCourts} court{totalCourts !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
