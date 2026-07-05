export type MediaType = 'image' | 'video' | 'audio' | 'document'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  banner_url: string | null
  bio: string | null
  created_at: string
  is_verified?: boolean
}

export interface VerificationRequest {
  id: string
  user_id: string
  utr: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
}

export interface Post {
  id: string
  user_id: string
  content: string | null
  media_urls: string[]
  media_types: MediaType[]
  created_at: string
  profiles?: Profile
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
  is_bookmarked?: boolean
}

export interface Comment {
  id: string
  user_id: string
  post_id: string
  parent_id: string | null
  content: string
  created_at: string
  profiles?: Profile
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string | null
  media_url: string | null
  created_at: string
  read_at: string | null
  sender?: Profile
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  post_id: string | null
  type: 'like' | 'comment' | 'follow' | 'message'
  read: boolean
  created_at: string
  actor?: Profile
}

export interface Conversation {
  user: Profile
  last_message: Message | null
  unread_count: number
}
