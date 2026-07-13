'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Notification } from '@/lib/types'

export async function getNotifications(): Promise<Notification[]> {
  try {
    const supabase = await createClient()
    if (!supabase) return []
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('notifications')
      .select('*, actor:profiles!actor_id(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return data || []
  } catch { return [] }
}

export async function markNotificationsRead() {
  try {
    const supabase = await createClient()
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    revalidatePath('/notifications')
  } catch {}
}

export async function getUnreadCount() {
  try {
    const supabase = await createClient()
    if (!supabase) return 0
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    return count || 0
  } catch { return 0 }
}

export async function getUnreadMessageCount() {
  try {
    const supabase = await createClient()
    if (!supabase) return 0
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .is('read_at', null)

    return count || 0
  } catch { return 0 }
}

export async function getUnreadCounts() {
  try {
    const supabase = await createClient()
    if (!supabase) return { notifications: 0, messages: 0 }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { notifications: 0, messages: 0 }

    const [{ count: notifCount }, { count: msgCount }] = await Promise.all([
      supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).is('read_at', null),
    ])

    return { notifications: notifCount || 0, messages: msgCount || 0 }
  } catch { return { notifications: 0, messages: 0 } }
}
