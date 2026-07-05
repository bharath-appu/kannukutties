'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Conversation, Message, Profile } from '@/lib/types'

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const receiverId = formData.get('receiver_id') as string
  const content = formData.get('content') as string

  const { error } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content,
  })

  if (error) return { error: error.message }

  await supabase.from('notifications').insert({
    user_id: receiverId,
    actor_id: user.id,
    type: 'message',
  })

  revalidatePath(`/messages/${receiverId}`)
  return { success: true }
}

export async function getConversations(): Promise<Conversation[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const [sentResult, receivedResult] = await Promise.all([
    supabase.from('messages').select('receiver_id').eq('sender_id', user.id),
    supabase.from('messages').select('sender_id').eq('receiver_id', user.id),
  ])

  const userIds = new Set<string>()
  sentResult.data?.forEach(m => userIds.add(m.receiver_id))
  receivedResult.data?.forEach(m => userIds.add(m.sender_id))

  if (userIds.size === 0) return []

  const [profileResult, messagesResult, unreadResult] = await Promise.all([
    supabase.from('profiles').select('*').in('id', [...userIds]),
    supabase.from('messages').select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase.from('messages').select('sender_id')
      .eq('receiver_id', user.id)
      .is('read_at', null),
  ])

  const profileMap = new Map<string, Profile>()
  for (const p of profileResult.data || []) {
    profileMap.set(p.id, p as Profile)
  }

  const lastMessageMap = new Map<string, any>()
  const seen = new Set<string>()
  for (const msg of messagesResult.data || []) {
    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
    const key = [user.id, otherId].sort().join(':')
    if (!seen.has(key)) {
      seen.add(key)
      lastMessageMap.set(otherId, msg)
    }
  }

  const unreadCounts = new Map<string, number>()
  for (const msg of unreadResult.data || []) {
    unreadCounts.set(msg.sender_id, (unreadCounts.get(msg.sender_id) || 0) + 1)
  }

  const conversations: Conversation[] = []
  for (const otherId of userIds) {
    const profile = profileMap.get(otherId)
    if (!profile) continue
    conversations.push({
      user: profile,
      last_message: lastMessageMap.get(otherId) || null,
      unread_count: unreadCounts.get(otherId) || 0,
    })
  }

  return conversations.sort((a, b) => {
    const aTime = a.last_message?.created_at || ''
    const bTime = b.last_message?.created_at || ''
    return bTime.localeCompare(aTime)
  })
}

export async function getMessages(otherUserId: string): Promise<Message[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
    .order('created_at', { ascending: true })

  if (data) {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', otherUserId)
      .eq('receiver_id', user.id)
      .is('read_at', null)
  }

  return data || []
}

export async function markMessagesRead(otherUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('sender_id', otherUserId)
    .eq('receiver_id', user.id)
    .is('read_at', null)
}
