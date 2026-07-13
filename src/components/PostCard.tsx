'use client'

import Link from 'next/link'
import { Heart, MessageCircle, Trash2, FileText, Mail, Repeat2 } from 'lucide-react'
import { toggleLike } from '@/lib/actions/likes'
import { deletePost } from '@/lib/actions/posts'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './Providers'
import Lightbox from './Lightbox'
import { proxyMediaUrl } from '@/lib/media'
import type { Post } from '@/lib/types'
import VerifiedBadge from '@/components/VerifiedBadge'

interface Props {
  post: Post
  showFull?: boolean
}

export default function PostCard({ post, showFull }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const [liked, setLiked] = useState(post.is_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [lightbox, setLightbox] = useState<{ src: string; type?: string } | null>(null)
  const isOwner = user?.id === post.user_id

  const handleLike = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
    try {
      await toggleLike(post.id)
    } catch {
      setLiked(liked)
      setLikesCount(likesCount)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    setIsDeleting(true)
    const result = await deletePost(post.id)
    if (result?.error) {
      setIsDeleting(false)
      return
    }
    router.refresh()
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className={`border-b border-[var(--border)] px-4 py-3 ${showFull ? '' : 'cursor-pointer hover:bg-[var(--surface-hover)]'} transition-colors`}>
      <div className="flex gap-3">
        <Link href={`/profile/${post.profiles?.username}`} className="shrink-0">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-[#1D9BF0]">
            {post.profiles?.avatar_url ? (
              <img src={proxyMediaUrl(post.profiles.avatar_url)!} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                {post.profiles?.display_name?.[0] || '?'}
              </div>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 min-w-0">
              <Link href={`/profile/${post.profiles?.username}`} className="flex items-center gap-1 hover:underline">
                <span className="truncate text-[15px] font-bold text-[var(--text-primary)]">
                  {post.profiles?.display_name || 'Unknown'}
                </span>
                {post.profiles?.is_verified && <VerifiedBadge size={14} />}
              </Link>
              <span className="truncate text-[15px] text-[var(--text-secondary)]">
                @{post.profiles?.username}
              </span>
              <span className="text-[15px] text-[var(--text-secondary)]">·</span>
              <span className="shrink-0 text-[15px] text-[var(--text-secondary)]">
                {timeAgo(post.created_at)}
              </span>
            </div>
            {isOwner && (
              <button onClick={handleDelete} disabled={isDeleting} className="shrink-0 p-1 text-[var(--text-secondary)] hover:text-[#F4212E] transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {post.content && (
            <Link href={`/post/${post.id}`}>
              <p className={`mt-1 text-[15px] leading-[20px] text-[var(--text-primary)] ${showFull ? '' : 'line-clamp-3'}`}>
                {post.content}
              </p>
            </Link>
          )}

          {post.media_urls?.length > 0 && (
            <div className={`mt-3 grid gap-2 ${post.media_urls.length === 1 ? '' : 'grid-cols-2'}`}>
              {post.media_urls.map((url, i) => {
                const type = post.media_types?.[i]
                return (
                  <div key={i} className="overflow-hidden rounded-[16px] bg-[var(--surface)]">
                    {type === 'image' ? (
                      <button onClick={() => setLightbox({ src: proxyMediaUrl(url)!, type: 'image' })} className="w-full">
                        <img src={proxyMediaUrl(url)} alt="" className="max-h-80 w-full cursor-pointer object-contain transition-opacity hover:opacity-90" loading="lazy" />
                      </button>
                    ) : type === 'video' ? (
                      <button onClick={() => setLightbox({ src: proxyMediaUrl(url)!, type: 'video' })} className="w-full">
                        <video src={proxyMediaUrl(url)} className="max-h-80 w-full cursor-pointer object-contain" />
                      </button>
                    ) : type === 'document' ? (
                      <div className="flex items-center justify-between border border-[var(--border)] rounded-[16px] p-3">
                        <a
                          href={proxyMediaUrl(url) ?? url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 transition-colors hover:opacity-80"
                        >
                          <FileText className="h-8 w-8 shrink-0 text-[#1D9BF0]" />
                          <span className="text-sm font-medium text-[var(--text-primary)]">View</span>
                        </a>
                        <a href={proxyMediaUrl(url) ?? url} download className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                          Download
                        </a>
                      </div>
                    ) : (
                      <audio src={proxyMediaUrl(url)} controls className="h-16 w-full" />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {lightbox && <Lightbox src={lightbox.src} type={lightbox.type} onClose={() => setLightbox(null)} />}

          <div className="mt-3 flex items-center justify-between max-w-[400px]">
            <Link href={`/post/${post.id}`} className="group flex items-center gap-1 text-[var(--text-secondary)] transition-colors hover:text-[#1D9BF0]">
              <MessageCircle className="h-[18px] w-[18px]" />
              <span className="text-xs">{post.comments_count ?? 0}</span>
            </Link>
            <button className="group flex items-center gap-1 text-[var(--text-secondary)] transition-colors hover:text-[#00BA7C]">
              <Repeat2 className="h-[18px] w-[18px]" />
            </button>
            <button onClick={handleLike} className={`group flex items-center gap-1 transition-colors ${liked ? 'text-[#F91880]' : 'text-[var(--text-secondary)] hover:text-[#F91880]'}`}>
              <Heart className={`h-[18px] w-[18px] ${liked ? 'fill-current' : ''}`} />
              <span className={`text-xs ${liked ? 'text-[#F91880]' : ''}`}>{likesCount}</span>
            </button>
            {user && !isOwner && post.profiles?.username && (
              <Link
                href={`/messages/${post.profiles.username}`}
                className="group flex items-center gap-1 text-[var(--text-secondary)] transition-colors hover:text-[#1D9BF0]"
                title={`Message ${post.profiles.display_name || post.profiles.username}`}
              >
                <Mail className="h-[18px] w-[18px]" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
