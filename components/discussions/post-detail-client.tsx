'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { timeAgo } from '@/lib/time-utils'
import { CommentSection } from './comment-section'
import { DiscussionsSidebar } from './discussions-sidebar'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import type { DiscussionPost, UserVote } from '@/lib/discussion-types'
import type { VoteDirection } from '@/lib/vote-helpers'
import { voteDelta, fromUserVote } from '@/lib/vote-helpers'
import { PostActionsMenu } from './post-actions-menu'
import { ImageCarousel } from './image-carousel'

const CATEGORY_META: Record<string, { slug: string; bg: string; fg: string }> = {
  'Chung':        { slug: 'chung',       bg: 'bg-sky-100',    fg: 'text-sky-600'    },
  'Kỹ thuật':    { slug: 'ky-thuat',    bg: 'bg-violet-100', fg: 'text-violet-600' },
  'Hỏi & Đáp':   { slug: 'hoi-dap',     bg: 'bg-amber-100',  fg: 'text-amber-600'  },
  'Giới thiệu':  { slug: 'gioi-thieu',  bg: 'bg-green-100',  fg: 'text-green-600'  },
  'Sản phẩm':    { slug: 'san-pham',    bg: 'bg-rose-100',   fg: 'text-rose-600'   },
  'Kinh nghiệm': { slug: 'kinh-nghiem', bg: 'bg-teal-100',   fg: 'text-teal-600'   },
  'Hoạt động':   { slug: 'hoat-dong',   bg: 'bg-orange-100', fg: 'text-orange-600' },
}

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

export function PostDetailClient({ post }: { post: DiscussionPost }) {
  const router = useRouter()
  const { user, userRole, loading: authLoading, requireAuth } = useAuth()
  const [userVote, setUserVote]         = useState<UserVote>(null)
  const [voteCount, setVoteCount]     = useState(post.upvoteCount)
  const [voteLoading, setVoteLoading] = useState(false)
  const [isSaved, setIsSaved]         = useState(false)

  const isPending = post.status === 'pending'
  const isCreator = !!user && user.uid === post.uid
  const canView = !isPending || isCreator || userRole === 'admin' || userRole === 'moderator'

  useEffect(() => {
    if (authLoading) return
    if (!canView) {
      router.replace('/discussions')
    }
  }, [authLoading, canView, router])

  useEffect(() => {
    if (!user) {
      setUserVote(null)
      setIsSaved(false)
      return
    }
    let cancelled = false
    ;(async () => {
      const token = await getIdToken()
      if (!token || cancelled) return
      const [voteRes, saveRes] = await Promise.all([
        fetch(`/api/discussions/${post.id}/vote`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/discussions/${post.id}/save`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (!cancelled) {
        if (voteRes.ok) {
          const data = await voteRes.json()
          setUserVote(data.vote ?? null)
        }
        if (saveRes.ok) {
          const data = await saveRes.json()
          setIsSaved(data.saved)
        }
      }
      fetch(`/api/discussions/${post.id}/history`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    })()
    return () => { cancelled = true }
  }, [user, post.id])

  function handleVote(e: React.MouseEvent, direction: VoteDirection) {
    e.preventDefault()
    requireAuth(() => doVote(direction))
  }

  async function doVote(direction: VoteDirection) {
    if (voteLoading) return

    const prevVote  = userVote
    const prevCount = voteCount
    const delta     = voteDelta(userVote === 'up' ? 1 : userVote === 'down' ? -1 : null, fromUserVote(direction))
    const nextVote: UserVote = (userVote === direction) ? null : direction
    setUserVote(nextVote)
    setVoteCount(voteCount + delta)
    setVoteLoading(true)

    try {
      const token = await getIdToken()
      const res = await fetch(`/api/discussions/${post.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ direction }),
      })
      const data = await res.json()
      if (res.ok) {
        setUserVote(data.vote ?? null)
        setVoteCount(data.score)
      } else {
        setUserVote(prevVote)
        setVoteCount(prevCount)
      }
    } catch {
      setUserVote(prevVote)
      setVoteCount(prevCount)
    } finally {
      setVoteLoading(false)
    }
  }

  const meta = CATEGORY_META[post.category] ?? { slug: 'chung', bg: 'bg-sky-100', fg: 'text-sky-600' }

  if (authLoading || !canView) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-28">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex gap-12">

          {/* Sidebar */}
          <DiscussionsSidebar
            activeCategory={null}
            onCategoryChange={(cat) => router.push(cat ? `/discussions?category=${cat}` : '/discussions')}
            onNewThread={() => requireAuth(() => router.push('/discussions/new'))}
            userRole={userRole}
            activeView="posts"
            onViewChange={(view) => {
              if (view === 'moderation') router.push('/discussions?view=moderation')
              else if (view === 'user-management') router.push('/discussions?view=user-management')
              else router.push('/discussions')
            }}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">

        {/* ── Post ── */}
        <div className="bg-white">

          {/* Credit bar */}
          <div className="flex items-start justify-between py-3">
            {/* Left: back + icon + meta */}
            <div className="flex items-start gap-2">
              {/* Back button */}
              <Link
                href="/discussions"
                className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Quay lại"
              >
                <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 9.1H4.679l5.487-5.462a.898.898 0 00.003-1.272.898.898 0 00-1.272-.003l-7.032 7a.898.898 0 000 1.275l7.03 7a.896.896 0 001.273-.003.898.898 0 00-.002-1.272l-5.487-5.462h12.82a.9.9 0 000-1.8z" />
                </svg>
              </Link>

              {/* Category circle */}
              <span className={cn('mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold', meta.bg, meta.fg)}>
                {meta.slug[0].toUpperCase()}
              </span>

              {/* Subreddit name + time + author */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[13px]">
                  <span className="font-bold text-gray-900">p/{meta.slug}</span>
                  <span className="text-gray-300 text-xs">•</span>
                  <time className="text-gray-500 text-[12px]">
                    {timeAgo(post.status === 'approved' && post.moderatedAt ? post.moderatedAt : post.createdAt)}
                  </time>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {post.photoURL && !post.isAnonymous ? (
                    <img
                      src={post.photoURL}
                      alt={post.author}
                      className="h-3.5 w-3.5 flex-shrink-0 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-[7px] font-bold text-primary">
                      {post.isAnonymous ? '?' : (post.authorInitials?.[0] ?? '?')}
                    </span>
                  )}
                  <span className="text-[12px] text-gray-500">
                    {post.isAnonymous ? 'Ẩn danh' : post.author}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: overflow menu */}
            <PostActionsMenu
              postId={post.id}
              creatorUid={post.uid}
              initialSaved={isSaved}
              onSavedChange={setIsSaved}
              onArchived={() => router.push('/discussions')}
            />
          </div>

          {/* Title */}
          <h1 className="mb-3 text-[22px] font-bold leading-snug text-gray-900">
            {post.title}
          </h1>

          {/* Body */}
          {post.description && (
            <div
              className="prosemirror-editor mb-4 text-[14px] leading-relaxed text-gray-800"
              dangerouslySetInnerHTML={{ __html: post.description }}
            />
          )}

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <ImageCarousel items={post.media} maxHeight={500} className="mb-4" />
          )}

          {/* Pending banner */}
          {isPending && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-4 flex-shrink-0">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              Bài viết đang chờ kiểm duyệt, chưa hiển thị công khai.
            </div>
          )}

          {/* Action bar — hidden for pending posts */}
          {!isPending && <div className="flex items-center gap-2 py-3">

            {/* Vote group pill: ↑ count ↓ */}
            <div className="flex items-center overflow-hidden rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700">
              <button
                onClick={(e) => handleVote(e, 'up')}
                disabled={voteLoading}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 transition-colors disabled:opacity-50 hover:bg-gray-50',
                  userVote === 'up' && 'text-primary',
                )}
              >
                {/* Upvote arrow */}
                <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                  {userVote === 'up'
                    ? <path d="M10 19a3.966 3.966 0 01-3.96-3.962V10.98H2.838a1.731 1.731 0 01-1.605-1.073 1.734 1.734 0 01.377-1.895L9.364.254a.925.925 0 011.272 0l7.754 7.759c.498.499.646 1.242.376 1.894-.27.652-.9 1.073-1.605 1.073h-3.202v4.058A3.965 3.965 0 019.999 19H10z" />
                    : <path d="M10 19a3.966 3.966 0 01-3.96-3.962V10.98H2.838a1.731 1.731 0 01-1.605-1.073 1.734 1.734 0 01.377-1.895L9.364.254a.925.925 0 011.272 0l7.754 7.759c.498.499.646 1.242.376 1.894-.27.652-.9 1.073-1.605 1.073h-3.202v4.058A3.965 3.965 0 019.999 19H10zM2.989 9.179H7.84v5.731c0 1.13.81 2.163 1.934 2.278a2.163 2.163 0 002.386-2.15V9.179h4.851L10 2.163 2.989 9.179z" />
                  }
                </svg>
                <span className={cn(
                  userVote === 'up' ? 'text-primary' : userVote === 'down' ? 'text-red-500' : '',
                )}>{voteCount}</span>
              </button>

              {/* Divider */}
              <span className="h-5 w-px bg-gray-200" />

              {/* Downvote */}
              <button
                onClick={(e) => handleVote(e, 'down')}
                disabled={voteLoading}
                className={cn(
                  'flex items-center px-3 py-1.5 transition-colors disabled:opacity-50 hover:bg-gray-50',
                  userVote === 'down' ? 'text-red-500' : 'text-gray-400',
                )}
              >
                <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                  {userVote === 'down'
                    ? <path d="M10 1a3.966 3.966 0 013.96 3.962V9.02h3.202c.706 0 1.335.42 1.605 1.073.27.652.122 1.396-.377 1.895l-7.754 7.759a.925.925 0 01-1.272 0l-7.754-7.76a1.734 1.734 0 01-.376-1.894c.27-.652.9-1.073 1.605-1.073h3.202V4.962A3.965 3.965 0 0110 1z" />
                    : <path d="M10 1a3.966 3.966 0 013.96 3.962V9.02h3.202c.706 0 1.335.42 1.605 1.073.27.652.122 1.396-.377 1.895l-7.754 7.759a.925.925 0 01-1.272 0l-7.754-7.76a1.734 1.734 0 01-.376-1.894c.27-.652.9-1.073 1.605-1.073h3.202V4.962A3.965 3.965 0 0110 1zm7.01 9.82h-4.85V5.09c0-1.13-.81-2.163-1.934-2.278a2.163 2.163 0 00-2.386 2.15v5.859H2.989l7.01 7.016 7.012-7.016z" />
                  }
                </svg>
              </button>
            </div>

            {/* Comments pill */}
            <a
              href="#comments"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1a9 9 0 00-9 9c0 1.947.79 3.58 1.935 4.957L.231 17.661A.784.784 0 00.785 19H10a9 9 0 009-9 9 9 0 00-9-9zm0 16.2H6.162c-.994.004-1.907.053-3.045.144l-.076-.188a36.981 36.981 0 002.328-2.087l-1.05-1.263C3.297 12.576 2.8 11.331 2.8 10c0-3.97 3.23-7.2 7.2-7.2s7.2 3.23 7.2 7.2-3.23 7.2-7.2 7.2z" />
              </svg>
              <span>{post.commentCount}</span>
            </a>

            {/* Share pill */}
            <button className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.8 17.524l6.89-6.887a.9.9 0 000-1.273L12.8 2.477a1.64 1.64 0 00-1.782-.349 1.64 1.64 0 00-1.014 1.518v2.593C4.054 6.728 1.192 12.075 1 17.376a1.353 1.353 0 00.862 1.32 1.35 1.35 0 001.531-.364l.334-.381c1.705-1.944 3.323-3.791 6.277-4.103v2.509c0 .667.398 1.262 1.014 1.518a1.638 1.638 0 001.783-.349v-.002zm-.994-1.548V12h-.9c-3.969 0-6.162 2.1-8.001 4.161.514-4.011 2.823-8.16 8-8.16h.9V4.024L17.784 10l-5.977 5.976z" />
              </svg>
              <span>Share</span>
            </button>
          </div>}

          <div className="border-t border-[#f0f0f0]" />
        </div>

        {/* ── Comments — hidden for pending posts ── */}
        {!isPending && (
          <div id="comments" className="bg-white pt-6 pb-16">
            <CommentSection postId={post.id} />
          </div>
        )}

          </div>{/* end main content */}
        </div>{/* end flex */}
      </div>
    </div>
  )
}
