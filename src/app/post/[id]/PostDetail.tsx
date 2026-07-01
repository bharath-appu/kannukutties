'use client'

import PostCard from '@/components/PostCard'
import CommentSection from '@/components/CommentSection'
import type { Post } from '@/lib/types'

interface Props {
  post: Post
}

export default function PostDetail({ post }: Props) {
  return (
    <div className="py-4 md:py-8">
      <PostCard post={post} showFull />
      <div className="mt-6">
        <CommentSection postId={post.id} />
      </div>
    </div>
  )
}
