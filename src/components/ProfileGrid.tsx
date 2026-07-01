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
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-12 text-center">
        <Grid3X3 className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900">No posts yet</h3>
        <p className="text-sm text-gray-500">When they post, it&apos;ll show up here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
