'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Types & Constants

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

interface MoodOption {
  value: string
  label: string
  icon: string
}

const MOODS: MoodOption[] = [
  { value: 'peaceful', label: 'Peaceful', icon: '🌿' },
  { value: 'restless', label: 'Restless', icon: '💫' },
  { value: 'joyful', label: 'Joyful', icon: '✨' },
  { value: 'confused', label: 'Confused', icon: '🌀' },
  { value: 'haunting', label: 'Haunting', icon: '🌊' },
]

const FREE_LIMIT = 5

function getMonthKey(): string {
  const d = new Date()
  return `nn_${d.getFullYear()}_${d.getMonth() + 1}`
}

// Main Component

export default function Home() {
  // --- State ---
  const [dream, setDream] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [reflection, setReflection] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reflectionsUsed, setReflectionsUsed] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [stars, setStars] = useState<Star[]>([])
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [mounted, setMounted] = useState(false)

  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const reflectionRef = useRef<HTMLDivElement>(null)

  // --- Effects ---

  // Generate star field & check voice support on mount
  useEffect(() => {
    setMounted(true)

    // Stars
    const newStars: Star[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.4,
      delay: Math.random() * 6,
      duration: Math.random() * 3 + 3,
    }))
    setStars(newStars)

    // Voice
    const SR =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    setVoiceSupported(!!SR)

    // Load reflection count
    try {
      const count = parseInt(localStorage.getItem(getMonthKey()) || '0', 10)
      setReflectionsUsed(isNaN(count) ? 0 : count)
    } catch {
      setReflectionsUsed(0)
    }
  }, [])

  // Auto-scroll to reflection when it appears
  useEffect(() => {
    if (reflection && reflectionRef.current) {
      setTimeout(() => {
        reflectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
  }, [reflection])

  // --- Voice Input ---

  const startRecording = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-GB'

    let finalTranscript = dream // Start from existing text

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + t
        } else {
          interim = t
        }
      }
      setDream(finalTranscript + (interim ? ' ' + interim : ''))
    }

    recognition.onerror = (event: any) => {
      setIsRecording(false)
      if (event.error === 'not-allowed') {
        setError('Microphone access was denied. Please allow mic access in your browser settings.')
      } else if (event.error === 'no-speech') {
        // Silence — just stop, no error
      } else {
        setError('Voice input encountered an issue. Please try again or type your dream.')
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    setError(null)
  }, [dream])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  // --- Submit ---

  const handleSubmit = async () => {
    if (!dream.trim()) return

    if (reflectionsUsed >= FREE_LIMIT) {
      setShowUpgrade(true)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setReflection(null)

    try {
      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream: dream.trim(), mood }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get reflection')
      }

      if (!data.reflection) {
        throw new Error('No reflection received. Please try again.')
      }

      setReflection(data.reflection)

      // Track usage
      try {
        const newCount = reflectionsUsed + 1
        localStorage.setItem(getMonthKey(), newCount.toString())
        setReflectionsUsed(newCount)
      } catch {
        // localStorage unavailable — continue anyway
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Reset ---

  const handleNewDream = () => {
    setDream('')
    setMood(null)
    setReflection(null)
    setError(null)
    setShowUpgrade(false)
    textareaRef.current?.focus()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- Derived ---

  const remaining = Math.max(0, FREE_LIMIT - reflectionsUsed)
  const canSubmit = dream.trim().length > 0 && !isSubmitting

  // Don't render interactive elements until mounted (avoid hydration mismatch)
  if (!mounted) {
    return (
      <main className="relative min-h-dvh">
        <div className="ambient-bg" />
      </main>
    )
  }

  // Render

  return (
    <main className="relative min-h-dvh">
      {/* --- Ambient Background --- */}
      <div className="ambient-bg" />

      {/* --- Star Field --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* --- Content --- */}
      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* Header */}
        <header className="w-full px-6 py-6 flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">🌙</span>
            <span className="font-display text-xl text-night-bright tracking-wide">
              Night Notes
            </span>
          </div>
          {remaining > 0 ? (
            <span className="text-xs text-night-subtle px-3 py-1.5 rounded-full border border-night-surface/50 bg-night-dark/40">
              {remaining} reflection{remaining !== 1 ? 's' : ''} left this month
            </span>
          ) : (
            <span className="text-xs text-night-accent px-3 py-1.5 rounded-full border border-night-accent/20 bg-night-accent/5">
              Free limit reached
            </span>
          )}
        </header>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-start px-6 pb-12">
          <div className="w-full max-w-xl">

            {/* --- DREAM INPUT SECTION --- */}
            {!reflection && (
              <div className="animate-fade-in">
                {/* Title */}
                <div className="text-center mb-10 mt-4">
                  <h1 className="font-display text-4xl sm:text-5xl text-night-bright mb-3 tracking-tight">
                    What did you dream?
                  </h1>
                  <p className="text-night-subtle text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                    Describe your dream in as much detail as you can remember —
                    the feelings, the colours, the people.
                  </p>
                </div>

                {/* Textarea + Voice */}
                <div className="relative mb-6">
                  <textarea
                    ref={textareaRef}
                    value={dream}
                    onChange={(e) => setDream(e.target.value)}
                    placeholder={
                      isRecording
                        ? 'Listening... speak your dream aloud'
                        : 'I was in a house I didn\'t recognise, but it felt like home...'
                    }
                    rows={6}
                    maxLength={3000}
                    className={`
                      glass-input w-full px-5 py-4 text-night-bright text-base leading-relaxed
                      font-body placeholder:text-night-subtle/40
                      ${isRecording ? 'border-night-recording/30' : ''}
                    `}
                    disabled={isSubmitting}
                  />

                  {/* Voice button */}
                  {voiceSupported && (
                    <button
                      onClick={toggleRecording}
                      disabled={isSubmitting}
                      className={`
                        absolute bottom-4 right-4 w-10 h-10 rounded-full
                        flex items-center justify-center transition-gentle
                        ${isRecording
                          ? 'bg-night-recording/20 text-night-recording'
                          : 'bg-night-surface/50 text-night-subtle hover:text-night-accent hover:bg-night-surface'
                        }
                      `}
                      title={isRecording ? 'Stop recording' : 'Record your dream'}
                      aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                    >
                      {/* Recording ring animation */}
                      {isRecording && (
                        <span className="absolute inset-0 rounded-full bg-night-recording/20 recording-ring" />
                      )}

                      {/* Mic icon */}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="relative z-10"
                      >
                        {isRecording ? (
                          /* Stop icon */
                          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                        ) : (
                          /* Mic icon */
                          <>
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" x2="12" y1="19" y2="22" />
                          </>
                        )}
                      </svg>
                    </button>
                  )}

                  {/* Character count */}
                  <div className="flex items-center justify-between mt-2 px-1">
                    {isRecording && (
                      <span className="text-xs text-night-recording flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-night-recording animate-pulse-soft" />
                        Listening...
                      </span>
                    )}
                    {!isRecording && voiceSupported && (
                      <span className="text-xs text-night-muted">
                        Tap the mic to speak your dream
                      </span>
                    )}
                    {!isRecording && !voiceSupported && <span />}
                    <span className="text-xs text-night-muted tabular-nums">
                      {dream.length.toLocaleString()}/3,000
                    </span>
                  </div>
                </div>

                {/* Mood selector */}
                <div className="mb-8">
                  <p className="text-xs text-night-muted mb-3 uppercase tracking-widest">
                    Mood upon waking
                    <span className="normal-case tracking-normal ml-1 text-night-subtle/50">
                      (optional)
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setMood(mood === m.value ? null : m.value)}
                        className={`mood-pill ${mood === m.value ? 'active' : ''}`}
                        disabled={isSubmitting}
                      >
                        <span className="mr-1.5">{m.icon}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`
                    w-full py-4 px-6 rounded-xl text-base font-medium
                    transition-gentle
                    ${canSubmit
                      ? 'bg-night-accent/15 text-night-accent border border-night-accent/25 hover:bg-night-accent/25 hover:border-night-accent/40 active:scale-[0.98]'
                      : 'bg-night-dark/40 text-night-muted border border-night-surface/30 cursor-not-allowed'
                    }
                  `}
                >
                  {isSubmitting ? 'Getting your reflection...' : 'Get Reflection'}
                </button>

                {/* Error message */}
                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-400/15 animate-fade-in">
                    <p className="text-sm text-red-300/80">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="text-xs text-red-400/60 hover:text-red-300/80 mt-2 transition-gentle"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Upgrade prompt */}
                {showUpgrade && (
                  <div className="mt-4 p-6 glass-card-elevated text-center animate-fade-in-up">
                    <p className="text-night-bright text-base mb-2">
                      You&apos;ve used all {FREE_LIMIT} free reflections this month
                    </p>
                    <p className="text-night-subtle text-sm mb-5">
                      Upgrade to Premium for unlimited reflections, voice input,
                      pattern insights, and more.
                    </p>
                    <button className="px-6 py-3 rounded-xl bg-night-accent/20 text-night-accent border border-night-accent/30 text-sm font-medium hover:bg-night-accent/30 transition-gentle">
                      Upgrade — £4.99/month
                    </button>
                    <p className="text-xs text-night-muted mt-3">
                      Resets on the 1st of each month
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* --- LOADING SHIMMER --- */}
            {isSubmitting && !reflection && (
              <div className="mt-6 space-y-4 animate-fade-in">
                <div className="glass-card p-6">
                  <div className="shimmer-line w-3/4 mb-4" />
                  <div className="shimmer-line w-full mb-3" />
                  <div className="shimmer-line w-full mb-3" />
                  <div className="shimmer-line w-5/6 mb-3" />
                  <div className="shimmer-line w-2/3" />
                </div>
              </div>
            )}

            {/* --- REFLECTION DISPLAY --- */}
            {reflection && (
              <div ref={reflectionRef} className="animate-fade-in-up space-y-5 mt-4">
                {/* Dream recap */}
                <div className="glass-card p-5">
                  <p className="text-xs text-night-muted uppercase tracking-widest mb-2">
                    Your dream
                  </p>
                  <p className="text-night-text text-sm leading-relaxed line-clamp-4">
                    {dream}
                  </p>
                  {mood && (
                    <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-night-accent/8 text-night-accent border border-night-accent/15">
                      {MOODS.find((m) => m.value === mood)?.icon}{' '}
                      {MOODS.find((m) => m.value === mood)?.label}
                    </span>
                  )}
                </div>

                {/* Reflection */}
                <div className="glass-card-elevated p-6 sm:p-8">
                  <p className="text-xs text-night-accent/70 uppercase tracking-widest mb-4">
                    Reflection
                  </p>
                  <div className="reflection-text text-night-bright/90 text-base leading-relaxed">
                    {reflection.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-night-muted text-center leading-relaxed px-4">
                  This is a gentle reflection, not professional advice.
                  For mental health support, please speak with a qualified professional.
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleNewDream}
                    className="flex-1 py-3.5 px-5 rounded-xl text-sm font-medium bg-night-accent/15 text-night-accent border border-night-accent/25 hover:bg-night-accent/25 transition-gentle active:scale-[0.98]"
                  >
                    New Dream
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full px-6 py-6 text-center">
          <p className="text-xs text-night-muted/60">
            Night Notes — Understand your dreams. Gently.
          </p>
        </footer>
      </div>
    </main>
  )
}
