'use client'

import { useState, useEffect } from 'react'
import { getNotifications, markNotificationsRead } from '@/lib/actions/notifications'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { proxyMediaUrl } from '@/lib/media'
import { Heart, MessageCircle, UserPlus, MessageSquare, Loader2, CheckCheck } from 'lucide-react'
import type { Notification } from '@/lib/types'

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    getNotifications().then(data => {
      setNotifications(data)
      markNotificationsRead()
    }).finally(() => setLoading(false))
  }, [user])

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="h-5 w-5 text-[#F91880]" />
      case 'comment': return <MessageCircle className="h-5 w-5 text-[#1D9BF0]" />
      case 'follow': return <UserPlus className="h-5 w-5 text-[#00BA7C]" />
      case 'message': return <MessageSquare className="h-5 w-5 text-[#1D9BF0]" />
      default: return null
    }
  }

  const getText = (notif: Notification) => {
    switch (notif.type) {
      case 'like': return 'liked your post'
      case 'comment': return 'commented on your post'
      case 'follow': return 'started following you'
      case 'message': return 'sent you a message'
      default: return ''
    }
  }

  const getLink = (notif: Notification) => {
    if (notif.type === 'follow') return `/profile/${notif.actor?.username}`
    if (notif.type === 'message') return `/messages/${notif.actor?.username}`
    if (notif.post_id) return `/post/${notif.post_id}`
    return `/profile/${notif.actor?.username}`
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return new Date(date).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D9BF0]" />
      </div>
    )
  }

  return (
    <div>
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <CheckCheck className="mx-auto mb-3 h-12 w-12 text-[var(--text-secondary)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">All caught up!</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">No notifications yet.</p>
        </div>
      ) : (
        <div>
          {notifications.map(notif => (
            <Link
              key={notif.id}
              href={getLink(notif)}
              className={`flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors hover:bg-[var(--surface-hover)] ${
                !notif.read ? 'bg-[#1D9BF0]/5' : ''
              }`}
            >
              <div className="relative shrink-0">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-[#1D9BF0]">
                  {notif.actor?.avatar_url ? (
                    <img src={proxyMediaUrl(notif.actor.avatar_url)!} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                      {notif.actor?.display_name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 rounded-full bg-[var(--background)] p-0.5">
                  {getIcon(notif.type)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--text-primary)]">
                  <span className="font-bold">
                    {notif.actor?.display_name || notif.actor?.username || 'Someone'}
                  </span>{' '}
                  {getText(notif)}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">{timeAgo(notif.created_at)}</p>
              </div>
              {!notif.read && (
                <span className="h-2 w-2 rounded-full bg-[#1D9BF0]" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
