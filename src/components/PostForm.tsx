'use client'

import { useState } from 'react'
import { createPost } from '@/lib/actions/posts'
import { uploadMedia } from '@/lib/actions/upload'
import MediaUploader from './MediaUploader'
import type { MediaUploadResult } from '@/lib/actions/upload'
import { useAuth } from './Providers'
import { useRouter } from 'next/navigation'

export default function PostForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<MediaUploadResult[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && media.length === 0) return
    setSubmitting(true)
    setError('')

    const formData = new FormData()
    formData.append('content', content)
    formData.append('media', JSON.stringify(media))
    const result = await createPost(formData)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    setContent('')
    setMedia([])
    setSubmitting(false)
    router.push('/')
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-[var(--border)] px-4 py-3">
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#1D9BF0]">
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
            {user.email?.[0].toUpperCase() || '?'}
          </div>
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's happening?"
            rows={3}
            className="w-full resize-none rounded-[4px] border-0 bg-transparent p-0 text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--text-secondary)] focus:ring-0"
            maxLength={2000}
          />
          <MediaUploader onMediaChange={setMedia} />
          {error && <p className="mt-2 text-sm text-[#F4212E]">{error}</p>}
          <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="text-xs text-[var(--text-secondary)]">{content.length}/2000</span>
            <button
              type="submit"
              disabled={submitting || (!content.trim() && media.length === 0)}
              className="rounded-full bg-[#1D9BF0] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1A8CD8] disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
