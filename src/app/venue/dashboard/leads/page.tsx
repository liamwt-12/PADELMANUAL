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

  return (
    <div>
      <div className="mb-6">
        <p className="label-caps">Leads</p>
        <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight">Player Enquiries</h1>
        <p className="mt-1 text-sm text-pm-muted">
          {leads.length > 0
            ? `${leads.filter(l => !l.contacted).length} unread of ${leads.length} total`
            : 'Enquiries from your listing appear here'
          }
        </p>
      </div>

      {!canViewLeads && (
        <div className="rounded-2xl border border-pm-accent/20 bg-pm-accent/[0.03] p-6 text-center">
          <h3 className="font-serif text-lg font-semibold tracking-tight">See every player lead</h3>
          <p className="mt-2 text-sm text-pm-muted max-w-sm mx-auto">
            Upgrade to Premium to see player enquiries, contact details, and mark leads as contacted.
          </p>
          <UpgradeButton className="mt-4" />
        </div>
      )}

      {canViewLeads && loading && (
        <div className="py-12 text-center">
          <div className="w-5 h-5 border-2 border-pm-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {canViewLeads && !loading && leads.length === 0 && (
        <div className="rounded-2xl border border-pm-border bg-pm-bg-card p-8 text-center">
          <p className="text-sm text-pm-muted">No leads yet.</p>
          <p className="mt-1 text-xs text-pm-faint">
            When players enquire through your listing, their details will appear here.
          </p>
        </div>
      )}

      {canViewLeads && !loading && leads.length > 0 && (
        <div className="rounded-2xl border border-pm-border bg-pm-bg-card divide-y divide-pm-border/40">
          {leads.map(lead => (
            <div key={lead.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!lead.contacted && (
                      <span className="w-1.5 h-1.5 rounded-full bg-pm-accent shrink-0" />
                    )}
                    <p className="text-sm font-medium text-pm-text">{lead.player_name}</p>
                    {lead.interest_type !== 'general' && (
                      <span className="text-[10px] uppercase tracking-wider text-pm-faint bg-pm-bg-hover rounded-full px-2 py-0.5 capitalize">
                        {lead.interest_type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-pm-muted mt-0.5">{lead.player_email}</p>
                  {lead.player_message && (
                    <p className="text-xs text-pm-faint mt-1 line-clamp-2">{lead.player_message}</p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-pm-faint">
                    {new Date(lead.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                  <button
                    onClick={() => toggleContacted(lead.id, lead.contacted)}
                    className={`mt-1 text-[10px] font-medium transition-colors ${
                      lead.contacted
                        ? 'text-emerald-600'
                        : 'text-pm-faint hover:text-pm-text'
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
