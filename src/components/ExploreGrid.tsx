'use client'

import { useState, useEffect } from 'react'
import { getExplorePosts } from '@/lib/actions/posts'
import PostCard from './PostCard'
import { Loader2 } from 'lucide-react'
import type { Post } from '@/lib/types'

export default function ExploreGrid() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExplorePosts()
      .then(data => setPosts(data as unknown as Post[]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900">Nothing to explore yet</h3>
        <p className="mt-1 text-sm text-gray-500">Posts will appear here once people start sharing!</p>
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
