'use client'

import PostCard from '@/components/PostCard'
import CommentSection from '@/components/CommentSection'
import type { Post } from '@/lib/types'

interface Props {
  post: Post
}

export default function PostDetail({ post }: Props) {
  return (
    <div>
      <PostCard post={post} showFull />
      <div className="border-b border-[var(--border)]">
        <CommentSection postId={post.id} />
      </div>
    </div>
  )
}
