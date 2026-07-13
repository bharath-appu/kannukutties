'use client'

import { useState, useEffect } from 'react'
import { getUserPosts } from '@/lib/actions/posts'
import PostCard from './PostCard'
import { Loader2, Grid3X3 } from 'lucide-react'
import type { Post } from '@/lib/types'

interface Props {
  userId: string
}

export default function ProfileGrid({ userId }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserPosts(userId)
      .then(data => setPosts(data as unknown as Post[]))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D9BF0]" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <Grid3X3 className="mx-auto mb-3 h-12 w-12 text-[var(--text-secondary)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">No posts yet</h3>
        <p className="text-sm text-[var(--text-secondary)]">When they post, it&apos;ll show up here.</p>
      </div>
    )
  }

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
