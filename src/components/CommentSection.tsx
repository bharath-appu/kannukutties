'use client'

import { useState, useEffect } from 'react'
import { getComments, createComment } from '@/lib/actions/comments'
import { useAuth } from './Providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    <div className="space-y-4">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 font-semibold text-gray-900 hover:text-gray-600 transition-colors"
      >
        <span>{showComments ? '▼' : '▶'}</span>
        Comments ({comments.length})
      </button>

      {showComments && (
        <>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/profile/${comment.profiles?.username}`}>
                <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shrink-0">
                  {comment.profiles?.avatar_url ? (
                    <img src={comment.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                      {comment.profiles?.display_name?.[0] || '?'}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link href={`/profile/${comment.profiles?.username}`} className="text-sm font-semibold text-gray-900 hover:underline truncate flex items-center gap-1">
                    {comment.profiles?.display_name || 'Unknown'}
                    {comment.profiles?.is_verified && <VerifiedBadge size={12} />}
                  </Link>
                  <span className="text-xs text-gray-400 shrink-0">{timeAgo(comment.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3 pt-2">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
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
              className="flex-1 rounded-full border bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
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
