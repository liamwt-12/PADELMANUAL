'use client'

import { useEffect, useState, useRef } from 'react'
import { useDashboard } from '@/lib/hooks/useVenueOwner'
import Link from 'next/link'

type Notification = {
  id: string
  type: string
  title: string
  body: string
  action_url: string | null
  read_at: string | null
  created_at: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function NotificationBell() {
  const { listing } = useDashboard()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listing) return
    fetch(`/api/venue/notifications?listing_id=${listing.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount)
        }
      })
      .catch(() => {})
  }, [listing])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleOpen() {
    setOpen(!open)
    if (!open && unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id)
      if (unreadIds.length > 0) {
        fetch('/api/venue/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_ids: unreadIds }),
        })
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
      }
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-pm-faint hover:text-pm-text transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pm-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-pm-border shadow-lg z-50">
          <div className="px-4 py-3 border-b border-pm-border/40">
            <p className="text-xs font-semibold text-pm-text">Notifications</p>
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-pm-faint">No notifications yet.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-pm-border/20 last:border-0 ${
                    !n.read_at ? 'bg-pm-accent/[0.03]' : ''
                  }`}
                >
                  {n.action_url ? (
                    <Link
                      href={n.action_url}
                      onClick={() => setOpen(false)}
                      className="block group"
                    >
                      <p className="text-xs font-medium text-pm-text group-hover:text-pm-accent transition-colors">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-pm-muted mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[10px] text-pm-faint mt-1">{timeAgo(n.created_at)}</p>
                    </Link>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-pm-text">{n.title}</p>
                      <p className="text-[11px] text-pm-muted mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[10px] text-pm-faint mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
