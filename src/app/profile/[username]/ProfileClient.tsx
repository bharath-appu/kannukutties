'use client'

import { useEffect, useState } from 'react'
import FollowButton from '@/components/FollowButton'
import ProfileGrid from '@/components/ProfileGrid'
import { getFollowCounts } from '@/lib/actions/follows'
import { useAuth } from '@/components/Providers'
import { proxyMediaUrl } from '@/lib/media'
import Link from 'next/link'
import { Calendar, MessageCircle, Settings } from 'lucide-react'
import type { Profile } from '@/lib/types'
import VerifiedBadge from '@/components/VerifiedBadge'

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
    <div>
      <div className="h-32 bg-[#1D9BF0] md:h-48">
        {profile.banner_url && (
          <img src={proxyMediaUrl(profile.banner_url)!} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="-mt-16 flex items-end justify-between md:-mt-20">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[var(--background)] bg-[#1D9BF0] md:h-36 md:w-36">
            {profile.avatar_url ? (
              <img src={proxyMediaUrl(profile.avatar_url)!} alt="" className="h-full w-full object-cover" />
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
                className="flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-2 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <Settings className="h-4 w-4" /> Edit profile
              </Link>
            ) : (
              <FollowButton targetUserId={profile.id} />
            )}
          </div>
        </div>

        <div className="mt-5">
          <h1 className="text-xl font-bold text-[var(--text-primary)] md:text-2xl flex items-center gap-1.5">
            {profile.display_name || profile.username}
            {profile.is_verified && <VerifiedBadge size={22} />}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">@{profile.username}</p>
        </div>

        {profile.bio && (
          <p className="mt-3 text-base text-[var(--text-primary)] leading-relaxed">{profile.bio}</p>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <Calendar className="h-4 w-4" />
          <span>Joined {joined}</span>
        </div>

        <div className="mt-5 flex gap-6">
          <button onClick={loadFollowers} className="text-sm hover:underline">
            <span className="font-bold text-[var(--text-primary)]">{followCounts.followers}</span>{' '}
            <span className="text-[var(--text-secondary)]">Followers</span>
          </button>
          <button onClick={loadFollowing} className="text-sm hover:underline">
            <span className="font-bold text-[var(--text-primary)]">{followCounts.following}</span>{' '}
            <span className="text-[var(--text-secondary)]">Following</span>
          </button>
        </div>

        {!isOwnProfile && user && (
          <Link
            href={`/messages/${profile.username}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1D9BF0] hover:underline transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> Send message
          </Link>
        )}
      </div>

      {(showFollowers || showFollowing) && (
        <div className="border-t border-[var(--border)] px-4 py-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-[var(--text-primary)]">
              {showFollowers ? 'Followers' : 'Following'}
            </h3>
            <button
              onClick={() => { setShowFollowers(false); setShowFollowing(false) }}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Close
            </button>
          </div>
          {loadingList ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
          ) : (
            <div className="space-y-3">
              {(showFollowers ? followers : following).map(p => (
                <Link
                  key={p.id}
                  href={`/profile/${p.username}`}
                  className="flex items-center gap-3 rounded-[16px] p-2 hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-[#1D9BF0] shrink-0">
                    {p.avatar_url ? (
                      <img src={proxyMediaUrl(p.avatar_url)!} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                        {p.display_name?.[0] || p.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--text-primary)] truncate">{p.display_name || p.username}</p>
                    <p className="text-xs text-[var(--text-secondary)]">@{p.username}</p>
                  </div>
                </Link>
              ))}
              {(showFollowers ? followers : following).length === 0 && (
                <p className="text-sm text-[var(--text-secondary)]">No one here yet.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-[var(--border)]">
        <ProfileGrid userId={profile.id} />
      </div>
    </div>
  )
}
