'use client'

import { useState } from 'react'

interface Review {
  id: string
  reviewer_name: string
  rating: number
  review_text: string
  owner_response: string | null
  owner_responded_at: string | null
  created_at: string
}

interface Props {
  listingId: string
  listingName: string
  initialReviews: Review[]
  totalCount: number
  averageRating: number
}

const RATING_LABELS = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Good' },
  { value: 4, label: 'Great' },
  { value: 5, label: 'Excellent' },
]

function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default function VenueReviews({
  listingId,
  listingName,
  initialReviews,
  totalCount,
  averageRating,
}: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [count, setCount] = useState(totalCount)
  const [avg, setAvg] = useState(averageRating)
  const [showForm, setShowForm] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formError, setFormError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState<number>(0)
  const [text, setText] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !rating || !text.trim()) {
      setFormError('All fields are required')
      return
    }
    setFormState('loading')
    setFormError('')

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          name: name.trim(),
          email: email.trim(),
          rating,
          review_text: text.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || 'Something went wrong')
        setFormState('error')
        return
      }
      setFormState('success')

      // Add the new review to the list
      const displayName = name.trim().split(/\s+/)
      const formatted = displayName.length >= 2
        ? `${displayName[0]} ${displayName[displayName.length - 1][0]}.`
        : displayName[0]
      const newReview: Review = {
        id: data.review_id,
        reviewer_name: formatted,
        rating,
        review_text: text.trim(),
        owner_response: null,
        owner_responded_at: null,
        created_at: new Date().toISOString(),
      }
      setReviews(prev => [newReview, ...prev])
      setCount(prev => prev + 1)
      setAvg(prev => {
        const newTotal = count + 1
        return Math.round(((prev * count + rating) / newTotal) * 10) / 10
      })
    } catch {
      setFormError('Something went wrong')
      setFormState('error')
    }
  }

  const displayed = showAll ? reviews : reviews.slice(0, 5)

  return (
    <section className="rounded-2xl border border-pm-border/30 bg-pm-bg-card p-6 md:p-8">
      {/* Score header */}
      <div className="label-caps !text-pm-accent mb-6">Player Reviews</div>

      {count === 0 ? (
        <div className="mb-6">
          <p className="text-sm text-pm-muted">
            No reviews yet.{' '}
            <button
              onClick={() => setShowForm(true)}
              className="text-pm-accent hover:underline"
            >
              Be the first to review {listingName}
            </button>
          </p>
        </div>
      ) : (
        <div className="mb-8">
          {count >= 3 ? (
            <>
              <p className="font-serif text-5xl tracking-tight text-pm-text">{avg.toFixed(1)}</p>
              <p className="text-sm text-pm-muted mt-1">Based on {count} visit{count !== 1 ? 's' : ''}</p>
            </>
          ) : (
            <>
              <span className="inline-block rounded-full bg-pm-accent/10 text-pm-accent px-3 py-1 text-xs font-semibold">
                New
              </span>
              <p className="text-sm text-pm-muted mt-2">{count} review{count !== 1 ? 's' : ''} so far</p>
            </>
          )}
        </div>
      )}

      {/* Review list */}
      {displayed.length > 0 && (
        <div className="space-y-0">
          {displayed.map((review, i) => (
            <div key={review.id} className={`py-5 ${i > 0 ? 'border-t border-pm-border/30' : ''}`}>
              <p className="text-sm leading-[1.8] text-pm-text">
                &ldquo;{review.review_text}&rdquo;
              </p>
              <p className="mt-2 text-sm text-pm-faint">
                {review.reviewer_name} · {formatMonth(review.created_at)}
              </p>

              {review.owner_response && (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-pm-accent/40">
                  <p className="text-[11px] font-medium text-pm-accent mb-1">From the venue:</p>
                  <p className="text-sm italic text-pm-muted">&ldquo;{review.owner_response}&rdquo;</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Show all */}
      {count > 5 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-2 text-sm text-pm-accent hover:text-pm-text transition-colors"
        >
          Show all {count} reviews
        </button>
      )}

      {/* Leave a review button / form */}
      {formState === 'success' ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
          <p className="text-sm text-emerald-700">
            Thanks{name ? `, ${name.split(' ')[0]}` : ''}. Your review has been added.
          </p>
        </div>
      ) : !showForm ? (
        <div className={count > 0 ? 'mt-6 pt-5 border-t border-pm-border/30' : ''}>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full border border-pm-accent text-pm-accent px-5 py-2.5 text-sm font-medium hover:bg-pm-accent/[0.06] transition-colors"
          >
            Leave a review
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 pt-5 border-t border-pm-border/30 space-y-4">
          {/* Rating selector */}
          <div>
            <p className="text-sm font-medium text-pm-text mb-2">How was it?</p>
            <div className="flex gap-2">
              {RATING_LABELS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRating(r.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    rating === r.value
                      ? 'bg-pm-accent text-white'
                      : 'border border-pm-border text-pm-muted hover:border-pm-accent/40'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Review text */}
          <div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value.slice(0, 280))}
              placeholder="What was your experience?"
              rows={3}
              className="w-full rounded-xl border border-pm-border px-4 py-3 text-sm bg-white focus:outline-none focus:border-pm-accent resize-none"
            />
            <p className="text-[10px] text-pm-faint mt-1 text-right">{text.length}/280</p>
          </div>

          {/* Name + email */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="rounded-xl border border-pm-border px-4 py-3 text-sm bg-white focus:outline-none focus:border-pm-accent"
            />
            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                className="rounded-xl border border-pm-border px-4 py-3 text-sm bg-white focus:outline-none focus:border-pm-accent w-full"
              />
              <p className="text-[10px] text-pm-faint mt-1">Won&apos;t be published</p>
            </div>
          </div>

          {formError && (
            <p className="text-sm text-red-500">{formError}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={formState === 'loading'}
              className="rounded-full bg-pm-accent text-white px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {formState === 'loading' ? 'Submitting...' : 'Submit review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-pm-faint hover:text-pm-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
