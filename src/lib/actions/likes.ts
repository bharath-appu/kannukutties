'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleLike(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ user_id: user.id, post_id: postId })
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
        type: 'like',
      })
    }
  }

  revalidatePath('/')
  revalidatePath(`/post/${postId}`)
}
