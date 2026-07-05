import Link from 'next/link'
import FollowButton from './FollowButton'
import type { Profile } from '@/lib/types'
import VerifiedBadge from '@/components/VerifiedBadge'

interface Props {
  profile: Profile
}

export default function UserCard({ profile }: Props) {
  return (
    <Link
      href={`/profile/${profile.username}`}
      className="flex items-center gap-3 rounded-xl border bg-white p-4 transition-colors hover:bg-gray-50"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold text-white">
            {profile.display_name?.[0] || profile.username[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 flex items-center gap-1">
          {profile.display_name || profile.username}
          {profile.is_verified && <VerifiedBadge size={14} />}
        </p>
        <p className="truncate text-sm text-gray-500">@{profile.username}</p>
        {profile.bio && <p className="mt-1 line-clamp-1 text-xs text-gray-400">{profile.bio}</p>}
      </div>
    </Link>
  )
}
