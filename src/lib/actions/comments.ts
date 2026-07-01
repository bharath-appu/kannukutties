'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const postId = formData.get('post_id') as string
  const content = formData.get('content') as string
  const parentId = formData.get('parent_id') as string | null

  const { error } = await supabase.from('comments').insert({
    user_id: user.id,
    post_id: postId,
    content,
    parent_id: parentId || null,
  })

  if (error) throw error

  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (post && post.user_id !== user.id) {
    await supabase.from('notifications').insert({
      user_id: post.user_id,
      actor_id: user.id,
      post_id: postId,
      type: 'comment',
    })
  }

  revalidatePath(`/post/${postId}`)
}

export async function getComments(postId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comments')
    .select('*, profiles!inner(*)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  return data || []
}
