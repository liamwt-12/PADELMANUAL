'use client'

import { useState } from 'react'

type Owner = {
  id: string
  email: string
  name: string | null
  subscription_status: string
  listing_id: string | null
  listing_name: string | null
  created_at: string
}

type OutreachEntry = {
  id: string
  listing_id: string | null
  email: string | null
  type: string
  status: string
  sent_at: string | null
  created_at: string
  notes: string | null
}

type Submission = {
  id: string
  venue_name: string
  city: string
  postcode: string | null
  contact_name: string
  contact_email: string
  role: string | null
  website_url: string | null
  courts: number | null
  indoor: string | null
  referral_source: string | null
  status: string
  created_at: string
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'premium' ? 'bg-pm-accent'
    : status === 'trial' ? 'bg-amber-400'
    : status === 'sent' ? 'bg-emerald-500'
    : status === 'pending' ? 'bg-amber-400'
    : status === 'failed' ? 'bg-red-400'
    : status === 'approved' ? 'bg-emerald-500'
    : 'bg-pm-ash'
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />
}

export default function AdminDashboard({
  owners,
  outreachLog,
  submissions,
}: {
  owners: Owner[]
  outreachLog: OutreachEntry[]
  submissions: Submission[]
}) {
  const [triggeringFeatured, setTriggeringFeatured] = useState(false)
  const [triggeringOutreach, setTriggeringOutreach] = useState(false)
  const [actionResult, setActionResult] = useState('')

  async function triggerCron(path: string, setter: (v: boolean) => void) {
    setter(true)
    setActionResult('')
    try {
      const res = await fetch(path)
      const data = await res.json()
      setActionResult(`${path}: ${JSON.stringify(data)}`)
    } catch (err) {
      setActionResult(`Error: ${err}`)
    }
    setter(false)
  }

  async function approveSubmission(id: string) {
    try {
      await fetch('/api/admin/approve-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      window.location.reload()
    } catch {
      setActionResult('Failed to approve')
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight text-pm-text mb-2">Admin</h1>
      <p className="text-sm text-pm-faint mb-8">Internal dashboard for Padel Manual.</p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => triggerCron('/api/cron/featured-venue', setTriggeringFeatured)}
          disabled={triggeringFeatured}
          className="btn-secondary text-xs disabled:opacity-50"
        >
          {triggeringFeatured ? 'Running...' : 'Trigger featured venue'}
        </button>
        <button
          onClick={() => triggerCron('/api/cron/outreach', setTriggeringOutreach)}
          disabled={triggeringOutreach}
          className="btn-secondary text-xs disabled:opacity-50"
        >
          {triggeringOutreach ? 'Running...' : 'Trigger outreach'}
        </button>
      </div>

      {actionResult && (
        <pre className="mb-8 text-xs text-pm-muted bg-pm-bg-hover rounded-xl p-4 overflow-x-auto">
          {actionResult}
        </pre>
      )}

      {/* Venue Submissions */}
      <section className="mb-10">
        <h2 className="font-serif text-xl tracking-tight text-pm-text mb-4">
          Venue Submissions ({submissions.length})
        </h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-pm-faint">No submissions.</p>
        ) : (
          <div className="rounded-2xl border border-pm-border bg-pm-bg-card divide-y divide-pm-border/40">
            {submissions.map(s => (
              <div key={s.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusDot status={s.status} />
                      <p className="text-sm font-medium text-pm-text">{s.venue_name}</p>
                      <span className="text-[10px] text-pm-faint">{s.city}</span>
                    </div>
                    <p className="text-xs text-pm-muted mt-1">
                      {s.contact_name} · {s.contact_email}
                      {s.role && ` · ${s.role}`}
                      {s.courts && ` · ${s.courts} courts`}
                      {s.indoor && ` · ${s.indoor}`}
                    </p>
                    {s.website_url && (
                      <p className="text-xs text-pm-accent mt-0.5">{s.website_url}</p>
                    )}
                    {s.referral_source && (
                      <p className="text-[10px] text-pm-faint mt-0.5">Referral: {s.referral_source}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-pm-faint">
                      {new Date(s.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short',
                      })}
                    </p>
                    {s.status === 'pending' && (
                      <button
                        onClick={() => approveSubmission(s.id)}
                        className="mt-1 text-[10px] font-medium text-pm-accent hover:underline"
                      >
                        Approve
                      </button>
                    )}
                    {s.status !== 'pending' && (
                      <p className="mt-1 text-[10px] text-emerald-600 font-medium capitalize">{s.status}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Venue Owners */}
      <section className="mb-10">
        <h2 className="font-serif text-xl tracking-tight text-pm-text mb-4">
          Venue Owners ({owners.length})
        </h2>
        <div className="rounded-2xl border border-pm-border bg-pm-bg-card divide-y divide-pm-border/40">
          {owners.map(o => (
            <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <StatusDot status={o.subscription_status} />
                  <p className="text-sm font-medium text-pm-text truncate">{o.listing_name || o.email}</p>
                </div>
                <p className="text-xs text-pm-faint mt-0.5">
                  {o.email} · {o.name || 'No name'}
                </p>
              </div>
              <span className="text-[10px] text-pm-faint capitalize shrink-0">
                {o.subscription_status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Outreach Log */}
      <section>
        <h2 className="font-serif text-xl tracking-tight text-pm-text mb-4">
          Recent Outreach ({outreachLog.length})
        </h2>
        {outreachLog.length === 0 ? (
          <p className="text-sm text-pm-faint">No outreach yet.</p>
        ) : (
          <div className="rounded-2xl border border-pm-border bg-pm-bg-card divide-y divide-pm-border/40">
            {outreachLog.map(entry => (
              <div key={entry.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusDot status={entry.status} />
                    <p className="text-sm text-pm-text truncate">{entry.email || 'No email'}</p>
                    <span className="text-[10px] text-pm-faint bg-pm-bg-hover rounded-full px-2 py-0.5">
                      {entry.type}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-[10px] text-pm-faint mt-0.5 truncate">{entry.notes}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-pm-faint">
                    {new Date(entry.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short',
                    })}
                  </p>
                  <p className="text-[10px] capitalize text-pm-faint">{entry.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
