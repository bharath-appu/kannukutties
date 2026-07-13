'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { MediaUploadResult } from './upload'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  const mediaJson = formData.get('media') as string
  const media: MediaUploadResult[] = mediaJson ? JSON.parse(mediaJson) : []

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    content: content || null,
    media_urls: media.map(m => m.url),
    media_types: media.map(m => m.type),
  })

  if (error) return { error: error.message }
  revalidatePath('/')
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
  if (profile) revalidatePath(`/profile/${profile.username}`)
  return { success: true }
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

function parsePosts(data: any[]): any[] {
  return (data || []).map(post => ({
    ...post,
    likes_count: post.likes_count?.[0]?.count != null ? Number(post.likes_count[0].count) : 0,
    comments_count: post.comments_count?.[0]?.count != null ? Number(post.comments_count[0].count) : 0,
  }))
}

function parsePost(post: any): any {
  if (!post) return post
  return {
    ...post,
    likes_count: post.likes_count?.[0]?.count != null ? Number(post.likes_count[0].count) : 0,
    comments_count: post.comments_count?.[0]?.count != null ? Number(post.comments_count[0].count) : 0,
  }
}

export async function getFeed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles!inner(*), likes_count:likes(count), comments_count:comments(count)')
      .order('created_at', { ascending: false })
      .limit(20)
    return parsePosts(data)
  }

  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = following?.map(f => f.following_id) || []
  followingIds.push(user.id)

  const { data } = await supabase
    .from('posts')
    .select('*, profiles!inner(*), likes_count:likes(count), comments_count:comments(count)')
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(50)

  return parsePosts(data)
}

export async function getExplorePosts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*, profiles!inner(*), likes_count:likes(count), comments_count:comments(count)')
    .order('created_at', { ascending: false })
    .limit(50)

  return parsePosts(data)
}

export async function getPost(postId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*, profiles!inner(*), likes_count:likes(count), comments_count:comments(count)')
    .eq('id', postId)
    .single()

  return parsePost(data)
}

export async function getUserPosts(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*, profiles!inner(*), likes_count:likes(count), comments_count:comments(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return parsePosts(data)
}

export async function searchPosts(query: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*, profiles!inner(*), likes_count:likes(count), comments_count:comments(count)')
    .ilike('content', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  return parsePosts(data)
}
