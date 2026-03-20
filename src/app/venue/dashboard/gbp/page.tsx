'use client'

import { useEffect, useState } from 'react'
import { useDashboard } from '@/lib/hooks/useVenueOwner'
import { createClient } from '@/lib/supabase-browser'
import GBPInsightsCard from '@/components/GBPInsightsCard'
import Link from 'next/link'

type GBPPost = {
  id: string
  post_text: string
  post_type: string
  status: string
  posted_at: string | null
  created_at: string
}

type Review = {
  id: string
  reviewer_name: string
  rating: number
  review_text: string
  owner_response: string | null
  created_at: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending approval',
  approved: 'Approved',
  posted: 'Posted',
  rejected: 'Rejected',
}

export default function GBPManagementPage() {
  const { listing, owner, isPremium, isTrial } = useDashboard()
  const [posts, setPosts] = useState<GBPPost[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [draftingReply, setDraftingReply] = useState<string | null>(null)
  const [aiDraft, setAiDraft] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replySending, setReplySending] = useState(false)
  const [descImproving, setDescImproving] = useState(false)
  const [suggestedDesc, setSuggestedDesc] = useState('')

  const gbpConnected = !!owner?.gbp_connected_at

  useEffect(() => {
    if (!listing) return
    fetch(`/api/venue/gbp-posts?listing_id=${listing.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.posts) setPosts(data.posts) })
      .catch(() => {})
      .finally(() => setLoadingPosts(false))
  }, [listing])

  useEffect(() => {
    if (!listing) return
    const supabase = createClient()
    supabase
      .from('venue_reviews')
      .select('*')
      .eq('listing_id', listing.id)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setReviews((data as Review[]) || [])
        setLoadingReviews(false)
      })
  }, [listing])

  async function handlePostAction(postId: string, action: 'approve' | 'reject', text?: string) {
    const res = await fetch('/api/venue/gbp-posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, action, post_text: text }),
    })
    if (res.ok) {
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, status: action === 'approve' ? 'posted' : 'rejected', post_text: text || p.post_text }
          : p
      ))
    }
  }

  async function handleEditSave(postId: string) {
    await fetch('/api/venue/gbp-posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, action: 'edit', post_text: editText }),
    })
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, post_text: editText } : p))
    setEditingPost(null)
    setEditText('')
  }

  async function handleAIDraft(review: Review) {
    setDraftingReply(review.id)
    setAiLoading(true)
    setAiDraft('')
    try {
      const res = await fetch('/api/venue/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'review_reply',
          venue_name: listing?.name,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          review_text: review.review_text,
        }),
      })
      const data = await res.json()
      setAiDraft(data.draft || '')
      setReplyText(data.draft || '')
    } catch {
      setAiDraft('')
    }
    setAiLoading(false)
  }

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
            ? { ...r, owner_response: replyText.trim() }
            : r,
        ))
        setDraftingReply(null)
        setReplyText('')
        setAiDraft('')
      }
    } catch { /* ignore */ }
    setReplySending(false)
  }

  async function handleImproveDescription() {
    setDescImproving(true)
    setSuggestedDesc('')
    try {
      const res = await fetch('/api/venue/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'description_improve',
          venue_name: listing?.name,
          current_description: listing?.description || listing?.short_blurb || '',
        }),
      })
      const data = await res.json()
      setSuggestedDesc(data.draft || '')
    } catch { /* ignore */ }
    setDescImproving(false)
  }

  if (!gbpConnected) {
    return (
      <div>
        <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-pm-text mb-2">
          Google Business Profile
        </h2>
        <p className="text-sm text-pm-muted mb-8">
          Connect your Google Business Profile to manage posts, reviews, and your description from here.
        </p>
        <a
          href="/api/gbp/connect"
          className="inline-flex items-center rounded-full bg-pm-accent text-white px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
        >
          Connect Google Business Profile
        </a>
      </div>
    )
  }

  const pendingPosts = posts.filter(p => p.status === 'pending')
  const postedPosts = posts.filter(p => p.status === 'posted' || p.status === 'approved')
  const unansweredReviews = reviews.filter(r => !r.owner_response)
  const answeredReviews = reviews.filter(r => r.owner_response)

  return (
    <div>
      <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-pm-text mb-2">
        Google Business Profile
      </h2>
      <p className="text-sm text-pm-muted mb-8">{listing?.name}</p>

      {/* 1. Overview strip */}
      <section className="mb-10">
        <GBPInsightsCard />
      </section>

      {/* 2. Google Posts */}
      <section className="mt-8 pt-8 border-t border-pm-border">
        <p className="label-caps mb-6">Google Posts</p>

        {loadingPosts ? (
          <div className="h-20 rounded-xl bg-pm-border/20 animate-pulse" />
        ) : (
          <>
            {pendingPosts.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-pm-muted mb-3">Pending approval</p>
                {pendingPosts.map(post => (
                  <div key={post.id} className="rounded-xl border border-pm-border/60 bg-white p-5 mb-3">
                    {editingPost === post.id ? (
                      <div>
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-pm-border px-3 py-2 text-sm bg-white focus:outline-none focus:border-pm-accent resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleEditSave(post.id)}
                            className="rounded-full bg-pm-accent text-white px-4 py-1.5 text-xs font-medium hover:opacity-90"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setEditingPost(null); setEditText('') }}
                            className="text-xs text-pm-faint hover:text-pm-text"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-pm-text leading-relaxed">&ldquo;{post.post_text}&rdquo;</p>
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            onClick={() => handlePostAction(post.id, 'approve')}
                            className="rounded-full bg-pm-accent text-white px-5 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
                          >
                            Approve &amp; Post &rarr;
                          </button>
                          <button
                            onClick={() => { setEditingPost(post.id); setEditText(post.post_text) }}
                            className="text-xs text-pm-muted hover:text-pm-text transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handlePostAction(post.id, 'reject')}
                            className="text-xs text-pm-faint hover:text-pm-text transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {postedPosts.length > 0 && (
              <div>
                <p className="text-xs font-medium text-pm-muted mb-3">
                  Posted &mdash; last 7 days
                </p>
                {postedPosts.slice(0, 5).map(post => (
                  <div key={post.id} className="py-3 border-b border-pm-border/20 last:border-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-pm-muted truncate flex-1">
                        {formatDate(post.posted_at || post.created_at)} &middot; &ldquo;{post.post_text.slice(0, 60)}...&rdquo;
                      </p>
                      <span className="text-[10px] text-pm-faint shrink-0">
                        {STATUS_LABELS[post.status] || post.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pendingPosts.length === 0 && postedPosts.length === 0 && (
              <p className="text-sm text-pm-muted">
                No posts yet. AI-generated posts will appear here every Thursday for your approval.
              </p>
            )}
          </>
        )}
      </section>

      {/* 3. Review Management */}
      <section className="mt-8 pt-8 border-t border-pm-border">
        <p className="label-caps mb-6">Google Reviews</p>

        {loadingReviews ? (
          <div className="h-20 rounded-xl bg-pm-border/20 animate-pulse" />
        ) : (
          <>
            {listing?.google_rating && (
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-serif text-3xl text-pm-text">
                  <span className="text-pm-accent">&#9733;</span> {listing.google_rating}
                </span>
                <span className="text-sm text-pm-muted">
                  &middot; {listing.google_review_count} reviews
                </span>
              </div>
            )}

            {unansweredReviews.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-pm-muted mb-3">
                  Unanswered &mdash; {unansweredReviews.length}
                </p>
                {unansweredReviews.map(review => (
                  <div key={review.id} className="py-4 border-b border-pm-border/30">
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-pm-text">{review.reviewer_name}</span>
                        <span className="text-xs text-pm-faint">
                          {'&#9733;'.repeat(review.rating)}
                        </span>
                      </div>
                      <span className="text-xs text-pm-faint">{formatDate(review.created_at)}</span>
                    </div>
                    <p className="text-sm text-pm-text leading-relaxed mt-1">
                      &ldquo;{review.review_text}&rdquo;
                    </p>

                    {draftingReply === review.id ? (
                      <div className="mt-3 ml-4 pl-4 border-l-2 border-pm-accent/40">
                        {aiLoading ? (
                          <div className="flex items-center gap-2 py-2">
                            <div className="w-4 h-4 border-2 border-pm-accent border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-pm-muted">Drafting reply...</span>
                          </div>
                        ) : (
                          <>
                            <textarea
                              value={replyText}
                              onChange={e => setReplyText(e.target.value.slice(0, 500))}
                              rows={3}
                              className="w-full rounded-xl border border-pm-border px-4 py-3 text-sm bg-white focus:outline-none focus:border-pm-accent resize-none"
                            />
                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() => submitReply(review.id)}
                                disabled={replySending || !replyText.trim()}
                                className="rounded-full bg-pm-accent text-white px-5 py-2 text-xs font-medium hover:opacity-90 disabled:opacity-50"
                              >
                                {replySending ? 'Sending...' : 'Post reply'}
                              </button>
                              <button
                                onClick={() => { setDraftingReply(null); setReplyText(''); setAiDraft('') }}
                                className="text-xs text-pm-faint hover:text-pm-text"
                              >
                                Cancel
                              </button>
                              <span className="text-[10px] text-pm-faint ml-auto">{replyText.length}/500</span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => handleAIDraft(review)}
                          className="rounded-full border border-pm-accent text-pm-accent px-4 py-1.5 text-xs font-medium hover:bg-pm-accent hover:text-white transition-colors"
                        >
                          AI Draft Reply
                        </button>
                        <button
                          onClick={() => { setDraftingReply(review.id); setReplyText('') }}
                          className="text-xs text-pm-muted hover:text-pm-text transition-colors"
                        >
                          Write own
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {answeredReviews.length > 0 && (
              <div>
                <p className="text-xs font-medium text-pm-muted mb-3">All reviews</p>
                {answeredReviews.slice(0, 10).map(review => (
                  <div key={review.id} className="py-3 border-b border-pm-border/20">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-pm-text">{review.reviewer_name}</span>
                      <span className="text-xs text-pm-faint">{formatDate(review.created_at)}</span>
                    </div>
                    <p className="text-xs text-pm-muted mt-1 truncate">&ldquo;{review.review_text}&rdquo;</p>
                    {review.owner_response && (
                      <p className="text-xs text-pm-faint mt-1 italic truncate">
                        Your reply: &ldquo;{review.owner_response}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {reviews.length === 0 && (
              <p className="text-sm text-pm-muted">No reviews yet on Padel Manual.</p>
            )}
          </>
        )}
      </section>

      {/* 4. Description Editor */}
      <section className="mt-8 pt-8 border-t border-pm-border">
        <p className="label-caps mb-6">Your Google Description</p>

        <div className="rounded-xl border border-pm-border/60 bg-white p-5">
          <p className="text-xs font-medium text-pm-muted mb-2">Current:</p>
          <p className="text-sm text-pm-text leading-relaxed">
            {listing?.description || listing?.short_blurb || 'No description set.'}
          </p>

          <div className="mt-4">
            <button
              onClick={handleImproveDescription}
              disabled={descImproving}
              className="rounded-full border border-pm-accent text-pm-accent px-5 py-2 text-xs font-medium hover:bg-pm-accent hover:text-white transition-colors disabled:opacity-50"
            >
              {descImproving ? 'Analysing...' : 'Analyse & Improve'}
            </button>
          </div>

          {suggestedDesc && (
            <div className="mt-4 pt-4 border-t border-pm-border/30">
              <p className="text-xs font-medium text-pm-muted mb-2">Suggested:</p>
              <p className="text-sm text-pm-text leading-relaxed">&ldquo;{suggestedDesc}&rdquo;</p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => setSuggestedDesc('')}
                  className="text-xs text-pm-faint hover:text-pm-text transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
