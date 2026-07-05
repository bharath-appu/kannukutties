'use client'

import Link from 'next/link'
import { Heart, MessageCircle, Trash2, FileText, Mail } from 'lucide-react'
import { toggleLike } from '@/lib/actions/likes'
import { deletePost } from '@/lib/actions/posts'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './Providers'
import Lightbox from './Lightbox'
import type { Post } from '@/lib/types'
import SpotlightCard from '@/components/reactbits/SpotlightCard'
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
    <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.08)" className={`rounded-xl border bg-white ${showFull ? '' : 'transition-shadow hover:shadow-md'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link href={`/profile/${post.profiles?.username}`} className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
              {post.profiles?.avatar_url ? (
                <img src={post.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                  {post.profiles?.display_name?.[0] || '?'}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-1">
                {post.profiles?.display_name || 'Unknown'}
                {post.profiles?.is_verified && <VerifiedBadge size={14} />}
              </p>
              <p className="text-sm text-gray-500">@{post.profiles?.username} · {timeAgo(post.created_at)}</p>
            </div>
          </Link>
          {isOwner && (
            <button onClick={handleDelete} disabled={isDeleting} className="text-gray-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {post.content && (
          <Link href={`/post/${post.id}`}>
            <p className={`mt-3 text-gray-800 ${showFull ? '' : 'line-clamp-3'}`}>{post.content}</p>
          </Link>
        )}

        {post.media_urls?.length > 0 && (
          <div className={`mt-3 grid gap-2 ${post.media_urls.length === 1 ? '' : 'grid-cols-2'}`}>
            {post.media_urls.map((url, i) => {
              const type = post.media_types?.[i]
              return (
                <div key={i} className="overflow-hidden rounded-lg bg-gray-100">
                  {type === 'image' ? (
                    <button onClick={() => setLightbox({ src: url, type: 'image' })} className="w-full">
                      <img src={url} alt="" className="max-h-80 w-full cursor-pointer object-contain transition-opacity hover:opacity-90" loading="lazy" />
                    </button>
                  ) : type === 'video' ? (
                    <button onClick={() => setLightbox({ src: url, type: 'video' })} className="w-full">
                      <video src={url} className="max-h-80 w-full cursor-pointer object-contain" />
                    </button>
                  ) : type === 'document' ? (
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <a
                        href={url.match(/\.pdf$/i) ? url : `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 transition-colors hover:opacity-80"
                      >
                        <FileText className="h-8 w-8 shrink-0 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">View</span>
                      </a>
                      <a href={url} download className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                        Download
                      </a>
                    </div>
                  ) : (
                    <audio src={url} controls className="h-16 w-full" />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {lightbox && <Lightbox src={lightbox.src} type={lightbox.type} onClose={() => setLightbox(null)} />}

        <div className="mt-3 flex items-center gap-6">
          <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likesCount}</span>
          </button>
          <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{post.comments_count ?? 0}</span>
          </Link>
          {user && !isOwner && post.profiles?.username && (
            <Link
              href={`/messages/${post.user_id}`}
              className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors"
              title={`Message ${post.profiles.display_name || post.profiles.username}`}
            >
              <Mail className="h-5 w-5" />
              <span className="text-sm hidden sm:inline">Message</span>
            </Link>
          )}
        </div>
      </div>
    </SpotlightCard>
  )
}
