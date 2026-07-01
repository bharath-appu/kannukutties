'use client'

import { useState, useEffect } from 'react'
import { toggleFollow, isFollowing } from '@/lib/actions/follows'
import { useAuth } from './Providers'
import { useRouter } from 'next/navigation'
import { UserPlus, UserMinus } from 'lucide-react'

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

  if (loading) return <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200" />
  if (user?.id === targetUserId) return null

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        following
          ? 'border border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:text-red-500'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {following ? (
        <>
          <UserMinus className="h-4 w-4" /> Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" /> Follow
        </>
      )}
    </button>
  )
}
