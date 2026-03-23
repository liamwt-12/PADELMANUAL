'use client'

import { useEffect, useState } from 'react'
import { useDashboard } from '@/lib/hooks/useVenueOwner'
import { createClient } from '@/lib/supabase-browser'

interface Review {
  id: string
  reviewer_name: string
  rating: number
  review_text: string
  owner_response: string | null
  owner_responded_at: string | null
  created_at: string
}

const RATING_WORDS: Record<number, string> = {
  1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DashboardReviews() {
  const { listing, owner, isPremium, isTrial, isImpersonating } = useDashboard()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replySending, setReplySending] = useState(false)

  useEffect(() => {
    if (!listing) return

    if (isImpersonating) {
      fetch('/api/admin/impersonate/data')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setReviews((data?.reviews as Review[]) || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
      return
    }

    const supabase = createClient()
    supabase
      .from('venue_reviews')
      .select('*')
      .eq('listing_id', listing.id)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data as Review[]) || [])
        setLoading(false)
      })
  }, [listing, isImpersonating])

  async function submitReply(reviewId: string) {
    if (!replyText.trim() || !owner?.email) return
    setReplySending(true)
    try {
      const res = await fetch('/api/reviews/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: reviewId,
          response_text: replyText.trim(),
          owner_email: owner.email,
        }),
      })
      if (res.ok) {
        setReviews(prev => prev.map(r =>
          r.id === reviewId
            ? { ...r, owner_response: replyText.trim(), owner_responded_at: new Date().toISOString() }
            : r,
        ))
        setReplyingTo(null)
        setReplyText('')
      }
    } catch { /* ignore */ }
    setReplySending(false)
  }

  const canReply = isPremium || isTrial

  return (
    <div>
      <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-pm-text mb-2">
        Reviews
      </h1>
      <p className="text-sm text-pm-muted mb-8">
        {listing?.name || 'Your Venue'}
      </p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-pm-border/20 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-pm-border/30 bg-pm-bg-card p-8 text-center">
          <p className="text-sm text-pm-muted">No reviews yet.</p>
          <p className="text-xs text-pm-faint mt-1">
            Reviews will appear here as players leave them on your listing.
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {reviews.map((review, i) => (
            <div key={review.id} className={`py-6 ${i > 0 ? 'border-t border-pm-border/30' : ''}`}>
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-2xl font-bold text-pm-text">{review.rating}</span>
                  <span className="text-xs text-pm-faint">{RATING_WORDS[review.rating] || ''}</span>
                </div>
                <span className="text-xs text-pm-faint">{formatDate(review.created_at)}</span>
              </div>

              <p className="text-sm leading-[1.8] text-pm-text mb-2">
                &ldquo;{review.review_text}&rdquo;
              </p>
              <p className="text-sm text-pm-faint">{review.reviewer_name}</p>

              {/* Owner response */}
              {review.owner_response ? (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-pm-accent/40">
                  <p className="text-[11px] font-medium text-pm-accent mb-1">Your response:</p>
                  <p className="text-sm italic text-pm-muted">&ldquo;{review.owner_response}&rdquo;</p>
                </div>
              ) : canReply ? (
                replyingTo === review.id ? (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-pm-accent/40">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value.slice(0, 280))}
                      placeholder="Write your response..."
                      rows={2}
                      className="w-full rounded-xl border border-pm-border px-4 py-3 text-sm bg-white focus:outline-none focus:border-pm-accent resize-none"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => submitReply(review.id)}
                        disabled={replySending || !replyText.trim()}
                        className="rounded-full bg-pm-accent text-white px-5 py-2 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {replySending ? 'Sending...' : 'Reply'}
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText('') }}
                        className="text-xs text-pm-faint hover:text-pm-text transition-colors"
                      >
                        Cancel
                      </button>
                      <span className="text-[10px] text-pm-faint ml-auto">{replyText.length}/280</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="mt-2 text-xs text-pm-accent hover:underline"
                  >
                    Reply to this review
                  </button>
                )
              ) : (
                <div className="mt-3 rounded-xl border border-pm-accent/20 bg-pm-accent/[0.03] p-3">
                  <p className="text-xs text-pm-muted">
                    <a href="/venue/dashboard/settings" className="text-pm-accent hover:underline font-medium">
                      Upgrade to Premium
                    </a>
                    {' '}to reply to player reviews.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
