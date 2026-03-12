import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'
import ClaimSearch from './ClaimSearch'

export const metadata: Metadata = {
  title: 'Claim Your Venue',
  description: 'Claim your padel venue listing on Padel Manual. Free to claim, takes 2 minutes.',
}

export default async function ClaimPage() {
  const supabase = await createClient()
  const { count } = await supabase
    .from('venue_owners')
    .select('*', { count: 'exact', head: true })

  const ownerCount = count || 0

  return (
    <main className="py-12 pb-20">
      <div className="max-w-xl mx-auto text-center">
        <p className="label-caps mb-3">For venue owners</p>
        <h1 className="font-serif text-4xl tracking-tight text-pm-text">
          Claim your venue
        </h1>
        <p className="mt-4 text-sm text-pm-muted leading-relaxed max-w-md mx-auto">
          {ownerCount > 0
            ? `Join ${ownerCount} venue owner${ownerCount !== 1 ? 's' : ''} already on Padel Manual Business.`
            : 'Join venue owners already on Padel Manual Business.'
          }
          {' '}Takes 2 minutes. Your dashboard is ready immediately.
        </p>

        <div className="mt-8 text-left">
          <ClaimSearch />
        </div>

        <div className="mt-8 space-y-3 text-xs text-pm-faint">
          <p>
            Already claimed?{' '}
            <a href="/venue/login" className="text-pm-accent hover:underline font-medium">Sign in →</a>
          </p>
          <p>
            Your venue isn&apos;t listed?{' '}
            <a href="/venues/add" className="text-pm-accent hover:underline font-medium">Add it here →</a>
          </p>
          <p>
            If you manage multiple venues, claim each one separately. Each listing has its own dashboard.
          </p>
        </div>
      </div>
    </main>
  )
}
