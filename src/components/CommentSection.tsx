'use client'

import { useState, useEffect } from 'react'
import { getComments, createComment } from '@/lib/actions/comments'
import { useAuth } from './Providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { proxyMediaUrl } from '@/lib/media'
import type { Comment } from '@/lib/types'
import VerifiedBadge from '@/components/VerifiedBadge'

interface Props {
  postId: string
}

export default function CommentSection({ postId }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    getComments(postId).then(setComments).finally(() => setLoading(false))
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    if (!content.trim()) return
    setSubmitting(true)
    const formData = new FormData()
    formData.append('post_id', postId)
    formData.append('content', content.trim())
    try {
      await createComment(formData)
      setContent('')
      const updated = await getComments(postId)
      setComments(updated)
    } catch {}
    setSubmitting(false)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="px-4 py-3">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] hover:text-[#1D9BF0] transition-colors"
      >
        <span>{showComments ? '▼' : '▶'}</span>
        Comments ({comments.length})
      </button>

      {showComments && (
        <>
      {loading ? (
        <div className="mt-3 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--surface)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface)]" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-[var(--surface)]" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">No comments yet. Be the first!</p>
      ) : (
        <div className="mt-3 space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/profile/${comment.profiles?.username}`}>
                <div className="h-8 w-8 overflow-hidden rounded-full bg-[#1D9BF0] shrink-0">
                  {comment.profiles?.avatar_url ? (
                    <img src={proxyMediaUrl(comment.profiles.avatar_url)!} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                      {comment.profiles?.display_name?.[0] || '?'}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link href={`/profile/${comment.profiles?.username}`} className="text-sm font-bold text-[var(--text-primary)] hover:underline truncate flex items-center gap-1">
                    {comment.profiles?.display_name || 'Unknown'}
                    {comment.profiles?.is_verified && <VerifiedBadge size={12} />}
                  </Link>
                  <span className="text-xs text-[var(--text-secondary)] shrink-0">{timeAgo(comment.created_at)}</span>
                </div>
                <p className="text-sm text-[var(--text-primary)]">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3 pt-3 mt-3 border-t border-[var(--border)]">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#1D9BF0]">
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
              {user.email?.[0].toUpperCase() || '?'}
            </div>
          </div>
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-full border border-[var(--border)] bg-transparent px-4 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[#1D9BF0]"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="rounded-full bg-[#1D9BF0] px-4 py-2 text-sm font-bold text-white hover:bg-[#1A8CD8] disabled:opacity-50 transition-colors"
            >
              {submitting ? '...' : 'Post'}
            </button>
          </div>
        </form>
      )}
        </>
      )}
    </div>
  )
}
