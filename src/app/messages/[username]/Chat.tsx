'use client'

import { useState, useEffect, useRef } from 'react'
import { getMessages, sendMessage } from '@/lib/actions/messages'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/Providers'
import { proxyMediaUrl } from '@/lib/media'
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
      .channel(`chat:${user.id}:${otherUser.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=in.(${user.id},${otherUser.id}),receiver_id=in.(${user.id},${otherUser.id})`,
      }, (payload: any) => {
        const msg = payload.new as Message
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, otherUser.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user) return
    setSending(true)

    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      sender_id: user.id,
      receiver_id: otherUser.id,
      content: content.trim(),
      media_url: null,
      created_at: new Date().toISOString(),
      read_at: null,
    }

    setMessages(prev => [...prev, optimistic])
    setContent('')

    const formData = new FormData()
    formData.append('receiver_id', otherUser.id)
    formData.append('content', content.trim())
    const result = await sendMessage(formData)
    if (result?.error) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
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
    <div className="flex flex-1 flex-col border-x border-[var(--border)]">
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
        <Link href="/messages" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="h-10 w-10 overflow-hidden rounded-full bg-[#1D9BF0]">
          {otherUser.avatar_url ? (
            <img src={proxyMediaUrl(otherUser.avatar_url)!} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-bold text-white">
              {otherUser.display_name?.[0] || '?'}
            </div>
          )}
        </div>
        <Link href={`/profile/${otherUser.username}`} className="font-bold text-[var(--text-primary)] hover:underline">
          {otherUser.display_name || otherUser.username}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#1D9BF0]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[var(--text-secondary)]">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-[16px] px-4 py-2 ${
                msg.sender_id === user?.id
                  ? 'bg-[#1D9BF0] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)]'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`mt-1 text-right text-[10px] ${
                  msg.sender_id === user?.id ? 'text-blue-200' : 'text-[var(--text-secondary)]'
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

      <form onSubmit={handleSend} className="sticky bottom-0 flex items-center gap-2 border-t border-[var(--border)] bg-[var(--background)] px-4 py-3">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-[var(--border)] bg-transparent px-4 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[#1D9BF0]"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9BF0] text-white hover:bg-[#1A8CD8] disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
