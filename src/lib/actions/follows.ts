'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (user.id === targetUserId) throw new Error('Cannot follow yourself')

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: targetUserId })
    if (error) throw error

    await supabase.from('notifications').insert({
      user_id: targetUserId,
      actor_id: user.id,
      type: 'follow',
    })
  }

  revalidatePath(`/profile/${targetUserId}`)
}

export async function isFollowing(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single()

  return !!data
}

export async function getFollowers(userId: string): Promise<Profile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follows')
    .select('follower_id, profiles!follows_follower_id_fkey(*)')
    .eq('following_id', userId)

  return (data?.map((d: any) => d.profiles) || []) as unknown as Profile[]
}

export async function getFollowing(userId: string): Promise<Profile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follows')
    .select('following_id, profiles!follows_following_id_fkey(*)')
    .eq('follower_id', userId)

  return (data?.map((d: any) => d.profiles) || []) as unknown as Profile[]
}

export async function getFollowCounts(userId: string) {
  const supabase = await createClient()

  const { count: followers } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  const { count: following } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  return { followers: followers || 0, following: following || 0 }
}
