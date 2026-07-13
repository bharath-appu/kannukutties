'use client'

import { useState, useEffect } from 'react'
import { getExplorePosts } from '@/lib/actions/posts'
import PostCard from './PostCard'
import { Loader2 } from 'lucide-react'
import type { Post } from '@/lib/types'

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExplorePosts()
      .then(data => setPosts(data as unknown as Post[]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1D9BF0]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No posts yet</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Explore what people are sharing!
          </p>
        </div>
      ) : (
        <div>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
