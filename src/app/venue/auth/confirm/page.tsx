import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in to your dashboard',
  // Don't let scanners or search engines index this page.
  robots: { index: false, follow: false },
}

// Force dynamic rendering — this page reads from search params.
export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{
    token_hash?: string
    type?: string
    next?: string
  }>
}

export default async function ConfirmPage({ searchParams }: Props) {
  const params = await searchParams
  const tokenHash = params.token_hash ?? ''
  const type = params.type ?? 'magiclink'
  const next = params.next ?? '/venue/dashboard'

  const hasToken = Boolean(tokenHash)

  return (
    <main className="py-20">
      <div className="mx-auto max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-pm-accent/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-pm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Sign in to your dashboard
        </h1>
        <p className="mt-3 text-sm text-pm-muted leading-relaxed">
          You&apos;re one click away from your Padel Manual venue dashboard.
        </p>

        {hasToken ? (
          <form
            method="POST"
            action="/venue/auth/callback"
            className="mt-8"
          >
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="btn-primary w-full text-center"
            >
              Sign in to dashboard &rarr;
            </button>
          </form>
        ) : (
          <p className="mt-8 text-sm text-red-600">
            This link is missing its verification token. Please request a new one.
          </p>
        )}

        <p className="mt-8 text-xs text-pm-faint leading-relaxed">
          For your security, this link expires after a single use.
          If it doesn&apos;t work,{' '}
          <a href="/venue/login" className="text-pm-accent hover:underline">
            request a new login link
          </a>
          .
        </p>
      </div>
    </main>
  )
}
