'use client'

import { useEffect, useState } from 'react'
import { useDashboard } from '@/lib/hooks/useVenueOwner'
import { createClient } from '@/lib/supabase-browser'
import UpgradeButton from '@/components/UpgradeButton'

type Lead = {
  id: string
  player_name: string
  player_email: string
  player_message: string | null
  interest_type: string
  contacted: boolean
  created_at: string
}

export default function LeadsPage() {
  const { listing, isPremium, isTrial } = useDashboard()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listing) { setLoading(false); return }
    const supabase = createClient()
    supabase
      .from('listing_leads')
      .select('*')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setLeads((data as Lead[]) || [])
        setLoading(false)
      })
  }, [listing])

  async function toggleContacted(leadId: string, current: boolean) {
    const supabase = createClient()
    await supabase
      .from('listing_leads')
      .update({ contacted: !current })
      .eq('id', leadId)

    setLeads(prev => prev.map(l =>
      l.id === leadId ? { ...l, contacted: !current } : l
    ))
  }

  const canViewLeads = isPremium || isTrial
  const unreadCount = leads.filter(l => !l.contacted).length

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl tracking-tight text-pm-text">Player Leads</h1>
        <p className="mt-2 text-sm text-pm-muted">
          {leads.length > 0
            ? `${unreadCount} unread of ${leads.length} total`
            : 'Enquiries from your listing appear here'
          }
        </p>
      </div>

      {/* ── Upgrade wall ── */}
      {!canViewLeads && (
        <div className="rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-8 text-center max-w-lg mx-auto">
          <h3 className="font-serif text-xl tracking-tight">See every player lead</h3>
          <p className="mt-3 text-sm text-pm-muted max-w-sm mx-auto leading-relaxed">
            Upgrade to Premium to see player enquiries, contact details, and mark leads as contacted.
          </p>
          <UpgradeButton className="mt-5" />
        </div>
      )}

      {/* ── Loading ── */}
      {canViewLeads && loading && (
        <div className="py-16 text-center">
          <div className="w-5 h-5 border-2 border-pm-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {/* ── Empty state ── */}
      {canViewLeads && !loading && leads.length === 0 && (
        <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-10 text-center max-w-lg mx-auto">
          <p className="text-sm text-pm-muted">No leads yet.</p>
          <p className="mt-2 text-xs text-pm-faint leading-relaxed">
            When players enquire through your listing, their details will appear here.
            They&apos;re already finding your venue.
          </p>
        </div>
      )}

      {/* ── Lead cards ── */}
      {canViewLeads && !loading && leads.length > 0 && (
        <div className="space-y-3">
          {leads.map(lead => (
            <div
              key={lead.id}
              className={`rounded-2xl border bg-pm-bg-card p-6 transition-all duration-200 ${
                !lead.contacted
                  ? 'border-l-2 border-l-pm-accent border-pm-border'
                  : 'border-pm-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    {!lead.contacted && (
                      <span className="w-2 h-2 rounded-full bg-pm-accent shrink-0" />
                    )}
                    <p className="text-sm font-medium text-pm-text">{lead.player_name}</p>
                    {lead.interest_type !== 'general' && (
                      <span className="text-[10px] uppercase tracking-wider text-pm-accent bg-pm-accent/[0.08] rounded-full px-2.5 py-0.5">
                        {lead.interest_type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-pm-muted mt-1.5">{lead.player_email}</p>
                  {lead.player_message && (
                    <p className="text-sm text-pm-muted mt-3 leading-relaxed line-clamp-2">
                      {lead.player_message}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[11px] text-pm-faint">
                    {new Date(lead.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                  <button
                    onClick={() => toggleContacted(lead.id, lead.contacted)}
                    className={`mt-2 text-[11px] font-medium transition-colors ${
                      lead.contacted
                        ? 'text-emerald-600 hover:text-emerald-700'
                        : 'text-pm-faint hover:text-pm-accent'
                    }`}
                  >
                    {lead.contacted ? 'Contacted' : 'Mark contacted'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
