'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Conversation, Message } from '@/lib/types'

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const receiverId = formData.get('receiver_id') as string
  const content = formData.get('content') as string

  const { error } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content,
  })

  if (error) throw error

  await supabase.from('notifications').insert({
    user_id: receiverId,
    actor_id: user.id,
    type: 'message',
  })

  revalidatePath(`/messages/${receiverId}`)
}

export async function getConversations(): Promise<Conversation[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: sentMessages } = await supabase
    .from('messages')
    .select('receiver_id')
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })

  const { data: receivedMessages } = await supabase
    .from('messages')
    .select('sender_id')
    .eq('receiver_id', user.id)
    .order('created_at', { ascending: false })

  const userIds = new Set<string>()
  sentMessages?.forEach((m: any) => userIds.add(m.receiver_id))
  receivedMessages?.forEach((m: any) => userIds.add(m.sender_id))

  const conversations: Conversation[] = []

  for (const otherId of userIds) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', otherId)
      .single()

    if (!profile) continue

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .or(`sender_id.eq.${otherId},receiver_id.eq.${otherId}`)
      .order('created_at', { ascending: false })
      .limit(1)

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', otherId)
      .eq('receiver_id', user.id)
      .is('read_at', null)

    conversations.push({
      user: profile,
      last_message: messages?.[0] || null,
      unread_count: count || 0,
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
    .select('*, sender:profiles!sender_id(*)')
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
