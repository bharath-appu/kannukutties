import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PostDetail from './PostDetail'
import SetupNotice from '@/components/SetupNotice'

function parsePost(post: any) {
  if (!post) return post
  return {
    ...post,
    likes_count: post.likes_count?.[0]?.count != null ? Number(post.likes_count[0].count) : 0,
    comments_count: post.comments_count?.[0]?.count != null ? Number(post.comments_count[0].count) : 0,
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return <SetupNotice />

  const { data: post } = await supabase
    .from('posts')
    .select('*, profiles!inner(*), likes_count:likes(count), comments_count:comments(count)')
    .eq('id', id)
    .single()

  if (!post) notFound()

  return <PostDetail post={parsePost(post)} />
}
