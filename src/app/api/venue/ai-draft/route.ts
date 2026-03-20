import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

/**
 * AI drafting endpoint for review replies and description improvements.
 * Uses Claude API to generate content in the venue's voice.
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
  }

  const { type, venue_name, reviewer_name, rating, review_text, current_description } = await request.json()

  let prompt: string

  if (type === 'review_reply') {
    prompt = `Write a professional reply to a Google review for a padel venue called "${venue_name}".
Tone: warm, professional, human. Not corporate. Under 100 words.
Never use: "amazing", "fantastic", "world-class", exclamation marks.
Thank the reviewer by name. If the review is positive, express genuine appreciation. If negative, acknowledge their concern without being defensive and invite them to get in touch directly.

Reviewer: ${reviewer_name}
Rating: ${rating}/5
Review: "${review_text}"

Write only the reply text, nothing else.`
  } else if (type === 'description_improve') {
    prompt = `Improve this Google Business Profile description for a padel venue called "${venue_name}".
Current description: "${current_description}"

Make it:
- Under 750 characters (Google's limit)
- Clear, specific, and informative
- Naturally incorporate relevant search terms (padel, courts, booking, location)
- Warm but not corporate
- Include a call to action

Never use: "amazing", "fantastic", "world-class", exclamation marks, or generic superlatives.
Write only the improved description text, nothing else.`
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'AI generation failed' }, { status: 502 })
  }

  const result = await res.json()
  const draft = result.content?.[0]?.text || ''

  return NextResponse.json({ draft })
}
