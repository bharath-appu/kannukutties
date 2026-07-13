'use client'

import { useState, useEffect } from 'react'
import { getConversations } from '@/lib/actions/messages'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/Providers'
import Link from 'next/link'
import { proxyMediaUrl } from '@/lib/media'
import { Loader2, MessageCircle } from 'lucide-react'
import type { Conversation } from '@/lib/types'

export default function ConversationList() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getConversations().then(setConversations).finally(() => setLoading(false))

    const supabase = createClient()
    const channel = supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        getConversations().then(setConversations)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D9BF0]" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <MessageCircle className="mx-auto mb-3 h-12 w-12 text-[var(--text-secondary)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">No messages yet</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Go to someone&apos;s profile to send them a message!</p>
      </div>
    )
  }

  return (
    <div>
      {conversations.map(conv => (
        <Link
          key={conv.user.id}
          href={`/messages/${conv.user.username}`}
          className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"
        >
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#1D9BF0]">
            {conv.user.avatar_url ? (
              <img src={proxyMediaUrl(conv.user.avatar_url)!} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-white">
                {conv.user.display_name?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[var(--text-primary)]">{conv.user.display_name || conv.user.username}</p>
              {conv.last_message && (
                <p className="text-xs text-[var(--text-secondary)]">
                  {new Date(conv.last_message.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <p className="truncate text-sm text-[var(--text-secondary)]">
              {conv.last_message?.content || 'No messages yet'}
            </p>
          </div>
          {conv.unread_count > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1D9BF0] text-xs font-bold text-white">
              {conv.unread_count}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
