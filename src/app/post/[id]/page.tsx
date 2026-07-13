import type { Metadata } from 'next'
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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return {}

  const { data: post } = await supabase
    .from('posts')
    .select('content, profiles!inner(username, display_name)')
    .eq('id', id)
    .single()

  if (!post) return {}

  const author = post.profiles?.display_name || post.profiles?.username || 'Post'
  const description = post.content
    ? post.content.slice(0, 200)
    : 'View this post on kanukuties'

  return {
    title: `${author}'s post`,
    description,
    openGraph: {
      title: `${author}'s post | kanukuties`,
      description,
    },
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
