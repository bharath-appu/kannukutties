'use client'

import { useState, useEffect } from 'react'
import { getFeed } from '@/lib/actions/posts'
import PostCard from './PostCard'
import { useAuth } from './Providers'
import { Loader2 } from 'lucide-react'
import type { Post } from '@/lib/types'

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    getFeed()
      .then(data => setPosts(data as unknown as Post[]))
      .finally(() => setLoading(false))
  }, [refreshKey])

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
            {user
              ? 'Follow some people or create your first post!'
              : 'Explore what people are sharing!'}
          </p>
        </div>
      ) : (
        <div>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {posts.length > 0 && !loading && (
        <div className="border-b border-[var(--border)] py-4 text-center">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="text-sm text-[#1D9BF0] hover:underline"
          >
            Refresh feed
          </button>
        </div>
      )}
    </div>
  )
}
