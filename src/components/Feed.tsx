'use client'

import { useState, useEffect } from 'react'
import { getFeed } from '@/lib/actions/posts'
import PostCard from './PostCard'
import PostForm from './PostForm'
import HeroScene from './HeroScene'
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
    <div className="mx-auto max-w-2xl space-y-4 pb-20 pt-4 md:pt-20">
      <HeroScene />
      {user && <PostForm />}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {user
              ? 'Follow some people or create your first post!'
              : 'Explore what people are sharing!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {posts.length > 0 && !loading && (
        <div className="text-center">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh feed
          </button>
        </div>
      )}
    </div>
  )
}
