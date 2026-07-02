'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { searchPosts } from '@/lib/actions/posts'
import { searchProfiles } from '@/lib/actions/profiles'
import PostCard from '@/components/PostCard'
import UserCard from '@/components/UserCard'
import { Loader2 } from 'lucide-react'
import type { Post, Profile } from '@/lib/types'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [posts, setPosts] = useState<Post[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'top' | 'people' | 'posts'>('top')

  useEffect(() => {
    if (!query) return
    setLoading(true)
    Promise.all([
      searchPosts(query).then(d => setPosts(d as unknown as Post[])),
      searchProfiles(query).then(setProfiles),
    ]).finally(() => setLoading(false))
  }, [query])

  if (!query) {
    return (
      <div className="rounded-xl border bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900">Search kanukuties</h3>
        <p className="mt-1 text-sm text-gray-500">Find people and posts</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Results for &ldquo;{query}&rdquo;
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        {posts.length + profiles.length} results found
      </p>

      <div className="mb-6 flex gap-4 border-b">
        {['top', 'people', 'posts'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t as typeof tab)}
            className={`border-b-2 pb-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {(tab === 'top' || tab === 'people') && profiles.length > 0 && (
            <div>
              {tab === 'top' && <h2 className="mb-3 text-lg font-semibold text-gray-900">People</h2>}
              <div className="grid gap-3 sm:grid-cols-2">
                {profiles.map(profile => (
                  <UserCard key={profile.id} profile={profile} />
                ))}
              </div>
            </div>
          )}

          {(tab === 'top' || tab === 'posts') && posts.length > 0 && (
            <div className={tab === 'top' ? 'mt-6' : ''}>
              {tab === 'top' && <h2 className="mb-3 text-lg font-semibold text-gray-900">Posts</h2>}
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {posts.length === 0 && profiles.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">No results found</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="py-4 md:py-8">
      <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
        <SearchContent />
      </Suspense>
    </div>
  )
}
