import Link from 'next/link'
import { proxyMediaUrl } from '@/lib/media'
import type { Profile } from '@/lib/types'
import VerifiedBadge from '@/components/VerifiedBadge'

interface Props {
  profile: Profile
}

export default function UserCard({ profile }: Props) {
  return (
    <Link
      href={`/profile/${profile.username}`}
      className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#1D9BF0]">
        {profile.avatar_url ? (
          <img src={proxyMediaUrl(profile.avatar_url)!} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold text-white">
            {profile.display_name?.[0] || profile.username[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[15px] text-[var(--text-primary)] flex items-center gap-1">
          {profile.display_name || profile.username}
          {profile.is_verified && <VerifiedBadge size={14} />}
        </p>
        <p className="truncate text-[15px] text-[var(--text-secondary)]">@{profile.username}</p>
        {profile.bio && <p className="mt-0.5 line-clamp-1 text-sm text-[var(--text-secondary)]">{profile.bio}</p>}
      </div>
    </Link>
  )
}
