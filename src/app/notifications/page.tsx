'use client'

import { useState, useEffect } from 'react'
import { getNotifications, markNotificationsRead } from '@/lib/actions/notifications'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
      case 'like': return <Heart className="h-5 w-5 text-red-500" />
      case 'comment': return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'follow': return <UserPlus className="h-5 w-5 text-green-500" />
      case 'message': return <MessageSquare className="h-5 w-5 text-purple-500" />
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
    if (notif.type === 'message') return `/messages/${notif.actor_id}`
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="py-4 md:py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <CheckCheck className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map(notif => (
            <Link
              key={notif.id}
              href={getLink(notif)}
              className={`flex items-center gap-3 rounded-xl border bg-white p-4 transition-colors hover:bg-gray-50 ${
                !notif.read ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="relative shrink-0">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                  {notif.actor?.avatar_url ? (
                    <img src={notif.actor.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                      {notif.actor?.display_name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5">
                  {getIcon(notif.type)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">
                    {notif.actor?.display_name || notif.actor?.username || 'Someone'}
                  </span>{' '}
                  {getText(notif)}
                </p>
                <p className="text-xs text-gray-400">{timeAgo(notif.created_at)}</p>
              </div>
              {!notif.read && (
                <span className="h-2 w-2 rounded-full bg-blue-600" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
