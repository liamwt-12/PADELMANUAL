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

type Report = {
  id: string
  listing_id: string | null
  report_type: string
  reporter_email: string | null
  notes: string | null
  status: string
  created_at: string
  listing_name: string | null
  listing_slug: string | null
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
  reports,
}: {
  owners: Owner[]
  outreachLog: OutreachEntry[]
  submissions: Submission[]
  reports: Report[]
}) {
  const [triggeringFeatured, setTriggeringFeatured] = useState(false)
  const [actionResult, setActionResult] = useState('')
  const [outreachEligible, setOutreachEligible] = useState<number | null>(null)
  const [outreachWithLeads, setOutreachWithLeads] = useState<number>(0)
  const [outreachBatchSize, setOutreachBatchSize] = useState(50)
  const [outreachSending, setOutreachSending] = useState(false)
  const [outreachLoadingPreview, setOutreachLoadingPreview] = useState(false)
  const [outreachSearch, setOutreachSearch] = useState('')
  const [outreachResults, setOutreachResults] = useState<{ id: string; name: string; city: string | null; email: string | null; manually_outreached_at: string | null }[]>([])
  const [outreachSearching, setOutreachSearching] = useState(false)
  const [outreachMarked, setOutreachMarked] = useState<Set<string>>(new Set())

  async function triggerFeaturedCron() {
    setTriggeringFeatured(true)
    setActionResult('')
    try {
      const res = await fetch('/api/cron/featured-venue')
      const data = await res.json()
      setActionResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setActionResult(`Error: ${err}`)
    }
    setTriggeringFeatured(false)
  }

  async function loadOutreachPreview() {
    setOutreachLoadingPreview(true)
    try {
      const res = await fetch('/api/cron/outreach?preview=true')
      const data = await res.json()
      setOutreachEligible(data.eligible ?? 0)
      setOutreachWithLeads(data.with_leads ?? 0)
    } catch {
      setActionResult('Failed to load outreach preview')
    }
    setOutreachLoadingPreview(false)
  }

  async function sendOutreachBatch() {
    const count = Math.min(outreachBatchSize, outreachEligible || 0)
    if (!confirm(`Send outreach emails to ${count} venues?`)) return
    setOutreachSending(true)
    setActionResult('')
    try {
      const res = await fetch(`/api/cron/outreach?batch_size=${outreachBatchSize}`)
      const data = await res.json()
      setActionResult(`Sent to ${data.sent} venues. ${data.skipped} skipped (no contact). Next eligible batch: ${data.remaining} venues remaining.`)
      setOutreachEligible(data.remaining)
    } catch (err) {
      setActionResult(`Error: ${err}`)
    }
    setOutreachSending(false)
  }

  async function searchOutreach(q: string) {
    setOutreachSearch(q)
    if (q.trim().length < 2) { setOutreachResults([]); return }
    setOutreachSearching(true)
    try {
      const res = await fetch(`/api/admin/manual-outreach?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setOutreachResults(data.venues || [])
    } catch { setOutreachResults([]) }
    setOutreachSearching(false)
  }

  async function markOutreached(listingId: string) {
    try {
      await fetch('/api/admin/manual-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      })
      setOutreachMarked(prev => new Set(prev).add(listingId))
    } catch {
      setActionResult('Failed to mark outreached')
    }
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

      {/* Outreach Trigger */}
      <section className="mb-10 rounded-2xl border border-pm-border bg-pm-bg-card p-6">
        <h2 className="font-serif text-xl tracking-tight text-pm-text mb-1">Send Outreach</h2>
        <p className="text-xs text-pm-faint mb-4">
          Automated cron runs weekdays at 9am UTC (batch of 50). You can also trigger manually below.
        </p>

        {outreachEligible === null ? (
          <button
            onClick={loadOutreachPreview}
            disabled={outreachLoadingPreview}
            className="btn-secondary text-xs disabled:opacity-50"
          >
            {outreachLoadingPreview ? 'Loading...' : 'Check eligible venues'}
          </button>
        ) : (
          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <div>
                <span className="font-serif text-2xl font-bold text-pm-text">{outreachEligible}</span>
                <span className="text-xs text-pm-faint ml-1.5">eligible venues</span>
              </div>
              {outreachWithLeads > 0 && (
                <div className="text-xs text-pm-muted">
                  {outreachWithLeads} with leads waiting
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-pm-faint">Batch size:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={outreachBatchSize}
                onChange={e => setOutreachBatchSize(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 px-3 py-2 text-sm border border-pm-border rounded-lg bg-white focus:outline-none focus:border-pm-accent"
              />
              <button
                onClick={sendOutreachBatch}
                disabled={outreachSending || outreachEligible === 0}
                className="btn-primary text-xs disabled:opacity-50"
              >
                {outreachSending ? 'Sending...' : `Send to ${Math.min(outreachBatchSize, outreachEligible)} venues`}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Other cron triggers */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={triggerFeaturedCron}
          disabled={triggeringFeatured}
          className="btn-secondary text-xs disabled:opacity-50"
        >
          {triggeringFeatured ? 'Running...' : 'Trigger featured venue'}
        </button>
      </div>

      {actionResult && (
        <pre className="mb-8 text-xs text-pm-muted bg-pm-bg-hover rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">
          {actionResult}
        </pre>
      )}

      {/* Manual Outreach */}
      <section className="mb-10">
        <h2 className="font-serif text-xl tracking-tight text-pm-text mb-4">
          Manual Outreach
        </h2>
        <p className="text-xs text-pm-faint mb-3">
          Search for a venue and mark it as manually outreached. The automated cron will skip it for 30 days.
        </p>
        <input
          type="text"
          value={outreachSearch}
          onChange={(e) => searchOutreach(e.target.value)}
          placeholder="Search venues by name..."
          className="w-full max-w-md px-4 py-2.5 text-sm border border-pm-border rounded-xl bg-white focus:outline-none focus:border-pm-accent"
        />
        {outreachSearching && (
          <p className="mt-2 text-xs text-pm-faint">Searching...</p>
        )}
        {outreachResults.length > 0 && (
          <div className="mt-3 rounded-2xl border border-pm-border bg-pm-bg-card divide-y divide-pm-border/40">
            {outreachResults.map(v => {
              const justMarked = outreachMarked.has(v.id)
              const recentlyOutreached = v.manually_outreached_at && (Date.now() - new Date(v.manually_outreached_at).getTime() < 30 * 24 * 60 * 60 * 1000)
              return (
                <div key={v.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-pm-text truncate">{v.name}</p>
                    <p className="text-xs text-pm-faint mt-0.5">
                      {v.city || 'No city'}
                      {v.email && <> · {v.email}</>}
                    </p>
                    {(recentlyOutreached || justMarked) && !justMarked && v.manually_outreached_at && (
                      <p className="text-[10px] text-amber-600 mt-0.5">
                        Outreached {new Date(v.manually_outreached_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {justMarked ? (
                      <span className="text-[10px] font-medium text-emerald-600">Marked today</span>
                    ) : (
                      <button
                        onClick={() => markOutreached(v.id)}
                        className="text-[10px] font-medium text-pm-accent hover:underline whitespace-nowrap"
                      >
                        Manually outreached today
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {outreachSearch.length >= 2 && !outreachSearching && outreachResults.length === 0 && (
          <p className="mt-2 text-xs text-pm-faint">No venues found.</p>
        )}
      </section>

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

      {/* Listing Reports */}
      <section className="mb-10">
        <h2 className="font-serif text-xl tracking-tight text-pm-text mb-4">
          Reports ({reports.length})
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-pm-faint">No reports.</p>
        ) : (
          <div className="rounded-2xl border border-pm-border bg-pm-bg-card divide-y divide-pm-border/40">
            {reports.map(r => (
              <div key={r.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusDot status={r.report_type === 'permanently_closed' ? 'failed' : 'pending'} />
                      <p className="text-sm font-medium text-pm-text">
                        {r.listing_name || 'Unknown venue'}
                      </p>
                      <span className="text-[10px] text-pm-faint bg-pm-bg-hover rounded-full px-2 py-0.5">
                        {r.report_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {r.notes && (
                      <p className="text-xs text-pm-muted mt-1">{r.notes}</p>
                    )}
                    {r.reporter_email && (
                      <p className="text-[10px] text-pm-faint mt-0.5">{r.reporter_email}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-pm-faint">
                      {new Date(r.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short',
                      })}
                    </p>
                    {r.status === 'pending' && (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={async () => {
                            if (!r.listing_id) return
                            await fetch('/api/listing/report', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                listing_id: r.listing_id,
                                report_type: 'admin_close',
                              }),
                            })
                            window.location.reload()
                          }}
                          className="text-[10px] font-medium text-red-500 hover:underline"
                        >
                          Mark closed
                        </button>
                        {r.listing_slug && (
                          <a
                            href={`/${r.listing_slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-medium text-pm-accent hover:underline"
                          >
                            View
                          </a>
                        )}
                      </div>
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
