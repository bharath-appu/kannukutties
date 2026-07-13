'use client'

import { useState, useEffect } from 'react'
import { toggleFollow, isFollowing } from '@/lib/actions/follows'
import { useAuth } from './Providers'
import { useRouter } from 'next/navigation'

interface Props {
  targetUserId: string
}

export default function FollowButton({ targetUserId }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    isFollowing(targetUserId).then(setFollowing).finally(() => setLoading(false))
  }, [user, targetUserId])

  const handleClick = async () => {
    if (!user) { router.push('/login'); return }
    setLoading(true)
    setFollowing(!following)
    try {
      await toggleFollow(targetUserId)
    } catch {
      setFollowing(following)
    }
    setLoading(false)
  }

  if (loading) return <div className="h-9 w-24 animate-pulse rounded-full bg-[var(--surface)]" />
  if (user?.id === targetUserId) return null

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
        following
          ? 'border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:border-[#F4212E] hover:text-[#F4212E]'
          : 'bg-[#1D9BF0] text-white hover:bg-[#1A8CD8]'
      }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
