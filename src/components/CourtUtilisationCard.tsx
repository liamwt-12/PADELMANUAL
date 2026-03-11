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
      <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6">
        <p className="label-caps mb-3">Court Utilisation</p>
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-pm-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (days.length === 0) return null

  const avgPct = Math.round(days.reduce((sum, d) => sum + d.pct, 0) / days.length)

  return (
    <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="label-caps">Court Utilisation</p>
        <span className="text-[10px] text-pm-faint">Next 7 days</span>
      </div>

      {/* Average utilisation */}
      <div className="mb-5 text-center">
        <p className="font-serif text-3xl font-bold tracking-tight">{avgPct}%</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-pm-faint mt-0.5">Avg booked</p>
      </div>

      {/* Daily bars */}
      <div className="flex items-end gap-1.5 h-20">
        {days.map(d => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-pm-bg-hover rounded-sm overflow-hidden" style={{ height: '60px' }}>
              <div
                className="w-full rounded-sm transition-all duration-500"
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

      <p className="mt-4 text-[10px] text-pm-faint text-center">
        Based on Playtomic availability · {totalCourts} court{totalCourts !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
