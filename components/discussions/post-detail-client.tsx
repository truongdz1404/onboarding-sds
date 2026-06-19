'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { VoteButton } from './vote-button'
import { CommentSection } from './comment-section'
import { timeAgo } from '@/lib/time-utils'
import type { DiscussionPost } from '@/lib/discussion-types'

const CATEGORY_COLORS: Record<string, string> = {
  'Chung': 'bg-slate-100 text-slate-600',
  'Văn hóa': 'bg-purple-100 text-purple-700',
  'Sản phẩm': 'bg-blue-100 text-blue-700',
  'Tip & Trick': 'bg-green-100 text-green-700',
  'Hỏi đáp': 'bg-amber-100 text-amber-700',
  'Thông báo': 'bg-red-100 text-red-600',
}

export function PostDetailClient({ post }: { post: DiscussionPost }) {
  const catColor = CATEGORY_COLORS[post.category] ?? 'bg-muted text-muted-foreground'

  return (
    <>
      <section className="border-b border-[#f0f0f0] bg-white pt-24 pb-8">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <Link
            href="/discussions"
            className="mb-7 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Thảo luận
          </Link>

          <div className="flex items-start gap-5">
            {/* Avatar */}
            {post.photoURL && !post.isAnonymous ? (
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-border">
                <Image src={post.photoURL} alt={post.author} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-orange-200 text-lg font-extrabold text-primary">
                {post.isAnonymous ? '?' : post.authorInitials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Tags */}
              <div className="mb-3 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${catColor}`}>
                  {post.category}
                </span>
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1
                className="font-bold text-2xl md:text-3xl text-text-dark"
                style={{ letterSpacing: '-0.02em', lineHeight: '1.25' }}
              >
                {post.title}
              </h1>

              {post.description && (
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
              )}

              {/* Author + vote row */}
              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-text-dark">
                      {post.isAnonymous ? 'Ẩn danh' : post.author}
                    </span>
                    {' · '}{timeAgo(post.createdAt)}
                    {' · '}{post.commentCount} bình luận
                  </p>
                </div>
                <VoteButton count={post.upvoteCount} postId={post.id} size="lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-screen bg-[#fafafa] py-10">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <CommentSection postId={post.id} />
        </div>
      </section>
    </>
  )
}
