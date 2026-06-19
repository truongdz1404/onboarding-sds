'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { VoteButton } from './vote-button'
import { timeAgo } from '@/lib/time-utils'
import type { DiscussionPost } from '@/lib/discussion-types'

interface PostCardProps {
  post: DiscussionPost
  voted?: boolean
  rank?: number
}

export function PostCard({ post, voted = false, rank }: PostCardProps) {
  return (
    <div className="group flex items-center gap-3 border-b border-[#f0f0f0] px-4 py-3.5 transition-colors duration-100 hover:bg-[#fafafa] sm:gap-4 sm:px-6 sm:py-4">
      {/* Vote */}
      <VoteButton count={post.upvoteCount} postId={post.id} voted={voted} size="sm" />

      {/* Avatar / thumbnail */}
      {post.photoURL ? (
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-border">
          <Image src={post.photoURL} alt={post.author} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-orange-200 text-sm font-extrabold text-primary">
          {post.authorInitials}
        </div>
      )}

      {/* Content */}
      <Link href={`/discussions/${post.id}`} className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-bold text-[15px] text-text-dark transition-colors group-hover:text-primary leading-snug">
            {post.title}
          </span>
          {post.description && (
            <span className="hidden text-sm text-muted-foreground sm:inline truncate">
              — {post.description}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {post.category}
          </span>
          {post.tags.slice(0, 2).map((t) => (
            <span key={t} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-500">
              {t}
            </span>
          ))}
          <span className="text-[11px] text-muted-foreground">
            · {post.isAnonymous ? 'Ẩn danh' : post.author} · {timeAgo(post.createdAt)}
          </span>
        </div>
      </Link>

      {/* Comment count */}
      <Link
        href={`/discussions/${post.id}#comments`}
        onClick={(e) => e.stopPropagation()}
        className="ml-2 flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MessageCircle size={14} />
        <span>{post.commentCount}</span>
      </Link>
    </div>
  )
}
