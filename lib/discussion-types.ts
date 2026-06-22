import type { UserVote } from '@/lib/vote-helpers'

export type { UserVote } from '@/lib/vote-helpers'

export type DiscussionPost = {
  id: string
  title: string
  description: string
  author: string
  authorInitials: string
  photoURL?: string
  uid?: string
  isAnonymous?: boolean
  category: string
  tags: string[]
  upvoteCount: number
  commentCount: number
  createdAt: string
  userVote?: UserVote
}

export type DiscussionComment = {
  id: string
  postId: string
  content: string
  author: string
  authorInitials: string
  photoURL?: string
  uid?: string
  isAnonymous?: boolean
  createdAt: string
  parentId?: string | null
  upvoteCount: number
  userVote?: UserVote
}
