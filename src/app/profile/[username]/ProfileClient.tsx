'use client'

import { useEffect, useState } from 'react'
import FollowButton from '@/components/FollowButton'
import ProfileGrid from '@/components/ProfileGrid'
import { getFollowCounts } from '@/lib/actions/follows'
import { getConversations } from '@/lib/actions/messages'
import { useAuth } from '@/components/Providers'
import Link from 'next/link'
import { Calendar, MessageCircle, Settings } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface Props {
  profile: Profile
  isOwnProfile: boolean
}

export default function ProfileClient({ profile, isOwnProfile }: Props) {
  const { user } = useAuth()
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [followers, setFollowers] = useState<Profile[]>([])
  const [following, setFollowing] = useState<Profile[]>([])
  const [loadingList, setLoadingList] = useState(false)

  useEffect(() => {
    getFollowCounts(profile.id).then(setFollowCounts)
  }, [profile.id])

  const loadFollowers = async () => {
    setLoadingList(true)
    const { getFollowers } = await import('@/lib/actions/follows')
    const data = await getFollowers(profile.id)
    setFollowers(data)
    setShowFollowers(true)
    setShowFollowing(false)
    setLoadingList(false)
  }

  const loadFollowing = async () => {
    setLoadingList(true)
    const { getFollowing } = await import('@/lib/actions/follows')
    const data = await getFollowing(profile.id)
    setFollowing(data)
    setShowFollowing(true)
    setShowFollowers(false)
    setLoadingList(false)
  }

  const joined = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })

  return (
    <div className="py-4 md:py-8">
      <div className="rounded-xl border bg-white">
        <div className="h-32 rounded-t-xl bg-gradient-to-r from-blue-400 to-purple-500 md:h-48">
          {profile.banner_url && (
            <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="relative px-5 pb-6 md:px-8">
          <div className="-mt-16 flex items-end justify-between md:-mt-20">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-purple-500 md:h-36 md:w-36">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white md:text-5xl">
                  {profile.display_name?.[0] || profile.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="pb-3 md:pb-5">
              {isOwnProfile ? (
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4" /> Edit profile
                </Link>
              ) : (
                <FollowButton targetUserId={profile.id} />
              )}
            </div>
          </div>

          <div className="mt-5">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-sm text-gray-500">@{profile.username}</p>
          </div>

          {profile.bio && (
            <p className="mt-3 text-base text-gray-700 leading-relaxed">{profile.bio}</p>
          )}

          <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Joined {joined}</span>
          </div>

          <div className="mt-5 flex gap-6">
            <button onClick={loadFollowers} className="text-sm hover:underline">
              <span className="font-bold text-gray-900">{followCounts.followers}</span>{' '}
              <span className="text-gray-500">Followers</span>
            </button>
            <button onClick={loadFollowing} className="text-sm hover:underline">
              <span className="font-bold text-gray-900">{followCounts.following}</span>{' '}
              <span className="text-gray-500">Following</span>
            </button>
          </div>

          {!isOwnProfile && user && (
            <Link
              href={`/messages/${profile.id}`}
              className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> Send message
            </Link>
          )}
        </div>
      </div>

      {(showFollowers || showFollowing) && (
        <div className="mt-5 rounded-xl border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {showFollowers ? 'Followers' : 'Following'}
            </h3>
            <button
              onClick={() => { setShowFollowers(false); setShowFollowing(false) }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
          {loadingList ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-3">
              {(showFollowers ? followers : following).map(p => (
                <Link
                  key={p.id}
                  href={`/profile/${p.username}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shrink-0">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                        {p.display_name?.[0] || p.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.display_name || p.username}</p>
                    <p className="text-xs text-gray-500">@{p.username}</p>
                  </div>
                </Link>
              ))}
              {(showFollowers ? followers : following).length === 0 && (
                <p className="text-sm text-gray-500">No one here yet.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <ProfileGrid userId={profile.id} />
      </div>
    </div>
  )
}
