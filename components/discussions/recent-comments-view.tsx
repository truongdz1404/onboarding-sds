'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { timeAgo } from '@/lib/time-utils'
import { cn } from '@/lib/utils'
import { CommentIcon } from '@/components/icons/comment-icon'
import type { DiscussionTopic } from '@/lib/discussion-types'

type RecentComment = {
  id: string
  commentId: string
  postId: string
  postTitle: string
  postCategory: string
  content: string
  author: string
  authorInitials: string
  photoURL?: string | null
  isAnonymous: boolean
  createdAt: string
}

export function RecentCommentsView() {
  const [comments, setComments] = useState<RecentComment[]>([])
  const [topics, setTopics] = useState<DiscussionTopic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/discussions/recent-comments').then((r) => r.json()),
      fetch('/api/topics').then((r) => r.json()),
    ])
      .then(([commentData, topicData]) => {
        setComments(commentData.comments ?? [])
        setTopics(topicData.topics ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex-1 min-w-0">
        <div className="space-y-0 divide-y divide-[#f3f4f6]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2 px-4 py-4">
              <div className="h-3 w-36 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 flex-shrink-0 animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-52 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="flex-1 min-w-0 py-28 text-center">
        <CommentIcon className="mx-auto mb-3 text-gray-300" width={40} height={40} />
        <p className="font-semibold text-gray-700">Chưa có bình luận gần đây</p>
        <p className="mt-1 text-sm text-gray-400">Các bình luận mới sẽ xuất hiện ở đây.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="divide-y divide-[#f3f4f6]">
        {comments.map((c) => {
          const topic = topics.find((t) => t.value === c.postCategory)
          const meta = topic
            ? { slug: topic.slug, bg: topic.bg, fg: topic.fg }
            : { slug: c.postCategory?.toLowerCase().replace(/\s+/g, '-') ?? 'chung', bg: 'bg-sky-100', fg: 'text-sky-600' }
          return (
            <Link
              key={c.id}
              href={`/discussions/${c.postId}`}
              className="block px-5 py-4 transition-colors hover:bg-[#f6f7f8]"
            >
              {/* Time + category */}
              <div className="mb-1.5 flex items-center gap-1.5 text-[12px] text-gray-400">
                <span>{timeAgo(c.createdAt)}</span>
                <span>in</span>
                <span className={cn(
                  'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                  meta.bg, meta.fg,
                )}>
                  {meta.slug[0].toUpperCase()}
                </span>
                <span className="font-medium text-gray-500">p/{meta.slug}</span>
              </div>

              {/* Post title */}
              <p className="mb-2 line-clamp-2 text-[14px] font-semibold leading-snug text-gray-900">
                {c.postTitle}
              </p>

              {/* Comment preview */}
              <div className="flex items-start gap-2">
                {c.photoURL && !c.isAnonymous ? (
                  <img
                    src={c.photoURL}
                    alt={c.author}
                    className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-[7px] font-bold text-primary">
                    {c.isAnonymous ? '?' : (c.authorInitials?.[0] ?? '?')}
                  </span>
                )}
                <p className="line-clamp-2 text-[13px] leading-relaxed text-gray-500">
                  <span className="font-medium text-gray-700">{c.author}:</span>{' '}
                  {c.content}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
