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
      <div className="px-4 py-12 text-center">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Search kanukuties</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Find people and posts</p>
      </div>
    )
  }

  return (
    <div>
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          Results for &ldquo;{query}&rdquo;
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {posts.length + profiles.length} results found
        </p>
      </div>

      <div className="flex border-b border-[var(--border)]">
        {['top', 'people', 'posts'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t as typeof tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors hover:bg-[var(--surface-hover)] ${
              tab === t ? 'text-[var(--text-primary)] border-b-2 border-[#1D9BF0]' : 'text-[var(--text-secondary)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1D9BF0]" />
        </div>
      ) : (
        <div>
          {(tab === 'top' || tab === 'people') && profiles.length > 0 && (
            <div>
              {tab === 'top' && (
                <h2 className="px-4 py-2 text-sm font-bold text-[var(--text-secondary)]">People</h2>
              )}
              {profiles.map(profile => (
                <UserCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}

          {(tab === 'top' || tab === 'posts') && posts.length > 0 && (
            <div>
              {tab === 'top' && (
                <h2 className="px-4 py-2 text-sm font-bold text-[var(--text-secondary)]">Posts</h2>
              )}
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {posts.length === 0 && profiles.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--text-secondary)]">No results found</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#1D9BF0]" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
