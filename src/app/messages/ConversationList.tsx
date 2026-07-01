'use client'

import { useState, useEffect } from 'react'
import { getConversations } from '@/lib/actions/messages'
import Link from 'next/link'
import { Loader2, MessageCircle } from 'lucide-react'
import type { Conversation } from '@/lib/types'

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConversations().then(setConversations).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-12 text-center">
        <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900">No messages yet</h3>
        <p className="mt-1 text-sm text-gray-500">Go to someone&apos;s profile to send them a message!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map(conv => (
        <Link
          key={conv.user.id}
          href={`/messages/${conv.user.id}`}
          className="flex items-center gap-3 rounded-xl border bg-white p-4 transition-colors hover:bg-gray-50"
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
            {conv.user.avatar_url ? (
              <img src={conv.user.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-white">
                {conv.user.display_name?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">{conv.user.display_name || conv.user.username}</p>
              {conv.last_message && (
                <p className="text-xs text-gray-400">
                  {new Date(conv.last_message.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <p className="truncate text-sm text-gray-500">
              {conv.last_message?.content || 'No messages yet'}
            </p>
          </div>
          {conv.unread_count > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {conv.unread_count}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
