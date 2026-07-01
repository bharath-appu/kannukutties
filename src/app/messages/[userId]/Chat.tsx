'use client'

import { useState, useEffect, useRef } from 'react'
import { getMessages, sendMessage } from '@/lib/actions/messages'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/Providers'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import type { Profile, Message } from '@/lib/types'

interface Props {
  otherUser: Profile
}

export default function Chat({ otherUser }: Props) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    getMessages(otherUser.id).then(setMessages).finally(() => setLoading(false))

    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${user.id}:${otherUser.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${otherUser.id},receiver_id=eq.${user.id}`,
      }, (payload: any) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, otherUser.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    const formData = new FormData()
    formData.append('receiver_id', otherUser.id)
    formData.append('content', content.trim())
    try {
      await sendMessage(formData)
      setContent('')
      const updated = await getMessages(otherUser.id)
      setMessages(updated)
    } catch {}
    setSending(false)
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex flex-1 flex-col rounded-xl border bg-white">
      <div className="flex items-center gap-3 border-b p-4">
        <Link href="/messages" className="text-gray-500 hover:text-gray-700 md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
          {otherUser.avatar_url ? (
            <img src={otherUser.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-bold text-white">
              {otherUser.display_name?.[0] || '?'}
            </div>
          )}
        </div>
        <Link href={`/profile/${otherUser.username}`} className="font-semibold text-gray-900 hover:underline">
          {otherUser.display_name || otherUser.username}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                msg.sender_id === user?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`mt-1 text-right text-[10px] ${
                  msg.sender_id === user?.id ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  {formatTime(msg.created_at)}
                  {msg.sender_id === user?.id && (
                    <span className="ml-1">{msg.read_at ? '✓✓' : '✓'}</span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t p-4">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border bg-gray-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
