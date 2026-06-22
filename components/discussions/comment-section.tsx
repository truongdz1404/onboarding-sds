'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { timeAgo } from '@/lib/time-utils'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import type { DiscussionComment, UserVote } from '@/lib/discussion-types'
import type { VoteDirection } from '@/lib/vote-helpers'

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

type CommentNode = DiscussionComment & { replies: CommentNode[] }

function buildTree(flat: DiscussionComment[]): CommentNode[] {
  const map = new Map<string, CommentNode>()
  flat.forEach((c) => map.set(c.id, { ...c, replies: [] }))
  const roots: CommentNode[] = []
  flat.forEach((c) => {
    const node = map.get(c.id)!
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

/* ── Inline reply composer ── */
function ReplyBox({ postId, parentId, authorName, onDone }: {
  postId: string; parentId: string; authorName: string; onDone: () => void
}) {
  const { requireAuth } = useAuth()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { ref.current?.focus() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    requireAuth(() => doSubmit())
  }
  async function doSubmit() {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      const token = await getIdToken()
      await fetch(`/api/discussions/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ content: content.trim(), parentId }),
      })
      setContent('')
      onDone()
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={submit} className="mt-2 mb-3">
      <textarea ref={ref} rows={3} value={content} onChange={(e) => setContent(e.target.value)}
        placeholder={`Trả lời u/${authorName}...`}
        className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
      />
      <div className="mt-1.5 flex justify-end gap-2">
        <button type="button" onClick={onDone}
          className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          Huỷ
        </button>
        <button type="submit" disabled={submitting || !content.trim()}
          className="flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {submitting && <Loader2 size={11} className="animate-spin" />}
          Bình luận
        </button>
      </div>
    </form>
  )
}

/* ── Comment card ── */
/*
  Layout (per comment):
  ┌──────┬────────────────────────────┐
  │ [av] │ name • time               │  ← header row
  │  │   │ body text                 │  ← body row    } thread line in left col
  │ [⊖]  │ ↑ count ↓  Reply  Share  │  ← action row  }   (only if has replies)
  └──────┴────────────────────────────┘
  ← ml-10 →
            ╰── reply1  (curved connector)
            ╰── reply2
*/
function CommentCard({ comment, postId, onRefresh, depth = 0, replyToName }: {
  comment: CommentNode; postId: string; onRefresh: () => void
  depth?: number; replyToName?: string
}) {
  const { requireAuth } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [userVote, setUserVote]         = useState<UserVote>(comment.userVote ?? null)
  const [voteCount, setVoteCount] = useState(comment.upvoteCount)
  const [voteLoading, setVoteLoading] = useState(false)

  useEffect(() => { setUserVote(comment.userVote ?? null) }, [comment.userVote])
  useEffect(() => { setVoteCount(comment.upvoteCount) }, [comment.upvoteCount])

  const hasReplies    = comment.replies.length > 0
  const authorDisplay = comment.isAnonymous ? 'Ẩn danh' : comment.author
  const initials      = comment.isAnonymous ? '?' : (comment.authorInitials?.[0] ?? '?')

  async function handleVote(e: React.MouseEvent, direction: VoteDirection) {
    e.stopPropagation()
    requireAuth(() => doVote(direction))
  }
  async function doVote(direction: VoteDirection) {
    if (voteLoading) return
    setVoteLoading(true)
    try {
      const token = await getIdToken()
      const res   = await fetch(`/api/discussions/${postId}/comments/${comment.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ direction }),
      })
      const data = await res.json()
      if (res.ok) {
        setUserVote(data.vote ?? null)
        setVoteCount(data.score)
      }
    } finally { setVoteLoading(false) }
  }

  return (
    <div>
      {/* ── flex row: [left 32px col] [right flex-1 col] ── */}
      <div className={cn('flex gap-2', hasReplies && !collapsed ? 'items-stretch' : 'items-start')}>

        {/* LEFT column: avatar → thread line → ⊖/⊕ */}
        <div className="flex w-8 flex-shrink-0 flex-col items-center">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.photoURL && !comment.isAnonymous ? (
              <img src={comment.photoURL} alt={authorDisplay}
                className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                {initials}
              </span>
            )}
          </div>

          {/* Thread line — stretches to fill height, only when has replies & expanded */}
          {hasReplies && !collapsed
            ? <div className="mt-1 w-0.5 flex-1 rounded-full bg-gray-200" />
            : <div className="flex-1" />
          }

          {/* ⊖/⊕ — only when comment has replies */}
          {hasReplies ? (
            <button onClick={() => setCollapsed((v) => !v)}
              className="flex-shrink-0 text-gray-300 transition-colors hover:text-gray-500">
              {collapsed
                ? /* ⊕ add-circle */
                  <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 1a9 9 0 100 18 9 9 0 000-18zm0 16.2a7.2 7.2 0 117.2-7.2 7.208 7.208 0 01-7.2 7.2zm.9-8.1H14v1.8h-3.1V14H9.1v-3.1H6V9.1h3.1V6h1.8v3.1z" />
                  </svg>
                : /* ⊖ subtract-circle */
                  <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2.8A7.2 7.2 0 112.8 10 7.208 7.208 0 0110 2.8zM10 1a9 9 0 100 18 9 9 0 000-18zm4 8.1H6v1.8h8V9.1z" />
                  </svg>
              }
            </button>
          ) : (
            /* Spacer so the right col bottom-pads symmetrically */
            <div className="h-4 flex-shrink-0" />
          )}
        </div>

        {/* RIGHT column: header + body + actions */}
        <div className="min-w-0 flex-1 pb-1">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[13px] font-bold text-gray-900">{authorDisplay}</span>
            <span className="text-[10px] text-gray-300">•</span>
            <time className="text-[12px] text-gray-400">{timeAgo(comment.createdAt)}</time>
          </div>

          {collapsed ? (
            <button onClick={() => setCollapsed(false)}
              className="mt-0.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
              {comment.replies.length} trả lời bị ẩn — nhấn để mở
            </button>
          ) : (
            <>
              {/* Body */}
              <p className="mb-2 mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-800">
                {replyToName && (
                  <span className="mr-1 font-semibold text-primary">@{replyToName}</span>
                )}
                {comment.content}
              </p>

              {/* Action bar */}
              <div className="mb-1 flex flex-wrap items-center gap-0.5 text-gray-500">
                {/* Upvote */}
                <button onClick={(e) => handleVote(e, 'up')} disabled={voteLoading}
                  className={cn('flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-gray-100 disabled:opacity-50',
                    userVote === 'up' ? 'text-primary' : 'text-gray-400')}>
                  <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                    {userVote === 'up'
                      ? <path d="M10 19a3.966 3.966 0 01-3.96-3.962V10.98H2.838a1.731 1.731 0 01-1.605-1.073 1.734 1.734 0 01.377-1.895L9.364.254a.925.925 0 011.272 0l7.754 7.759c.498.499.646 1.242.376 1.894-.27.652-.9 1.073-1.605 1.073h-3.202v4.058A3.965 3.965 0 019.999 19H10z" />
                      : <path d="M10 19a3.966 3.966 0 01-3.96-3.962V10.98H2.838a1.731 1.731 0 01-1.605-1.073 1.734 1.734 0 01.377-1.895L9.364.254a.925.925 0 011.272 0l7.754 7.759c.498.499.646 1.242.376 1.894-.27.652-.9 1.073-1.605 1.073h-3.202v4.058A3.965 3.965 0 019.999 19H10zM2.989 9.179H7.84v5.731c0 1.13.81 2.163 1.934 2.278a2.163 2.163 0 002.386-2.15V9.179h4.851L10 2.163 2.989 9.179z" />
                    }
                  </svg>
                </button>
                {/* Vote count */}
                <span className={cn('min-w-[1.25rem] text-center text-[12px] font-semibold',
                  userVote === 'up' ? 'text-primary' : userVote === 'down' ? 'text-red-500' : 'text-gray-500')}>
                  {voteCount}
                </span>
                {/* Downvote */}
                <button onClick={(e) => handleVote(e, 'down')} disabled={voteLoading}
                  className={cn('flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-gray-100 disabled:opacity-50',
                    userVote === 'down' ? 'text-red-500' : 'text-gray-400')}>
                  <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                    {userVote === 'down'
                      ? <path d="M10 1a3.966 3.966 0 013.96 3.962V9.02h3.202c.706 0 1.335.42 1.605 1.073.27.652.122 1.396-.377 1.895l-7.754 7.759a.925.925 0 01-1.272 0l-7.754-7.76a1.734 1.734 0 01-.376-1.894c.27-.652.9-1.073 1.605-1.073h3.202V4.962A3.965 3.965 0 0110 1z" />
                      : <path d="M10 1a3.966 3.966 0 013.96 3.962V9.02h3.202c.706 0 1.335.42 1.605 1.073.27.652.122 1.396-.377 1.895l-7.754 7.759a.925.925 0 01-1.272 0l-7.754-7.76a1.734 1.734 0 01-.376-1.894c.27-.652.9-1.073 1.605-1.073h3.202V4.962A3.965 3.965 0 0110 1zm7.01 9.82h-4.85V5.09c0-1.13-.81-2.163-1.934-2.278a2.163 2.163 0 00-2.386 2.15v5.859H2.989l7.01 7.016 7.012-7.016z" />
                    }
                  </svg>
                </button>
                {/* Reply */}
                <button onClick={() => setShowReply((v) => !v)}
                  className="ml-1 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold text-gray-500 transition-colors hover:bg-gray-100">
                  <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 1a9 9 0 00-9 9c0 1.947.79 3.58 1.935 4.957L.231 17.661A.784.784 0 00.785 19H10a9 9 0 009-9 9 9 0 00-9-9zm0 16.2H6.162c-.994.004-1.907.053-3.045.144l-.076-.188a36.981 36.981 0 002.328-2.087l-1.05-1.263C3.297 12.576 2.8 11.331 2.8 10c0-3.97 3.23-7.2 7.2-7.2s7.2 3.23 7.2 7.2-3.23 7.2-7.2 7.2z" />
                  </svg>
                  Reply
                </button>
                {/* Share */}
                <button className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold text-gray-500 transition-colors hover:bg-gray-100">
                  <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.8 17.524l6.89-6.887a.9.9 0 000-1.273L12.8 2.477a1.64 1.64 0 00-1.782-.349 1.64 1.64 0 00-1.014 1.518v2.593C4.054 6.728 1.192 12.075 1 17.376a1.353 1.353 0 00.862 1.32 1.35 1.35 0 001.531-.364l.334-.381c1.705-1.944 3.323-3.791 6.277-4.103v2.509c0 .667.398 1.262 1.014 1.518a1.638 1.638 0 001.783-.349v-.002zm-.994-1.548V12h-.9c-3.969 0-6.162 2.1-8.001 4.161.514-4.011 2.823-8.16 8-8.16h.9V4.024L17.784 10l-5.977 5.976z" />
                  </svg>
                  Share
                </button>
              </div>

              {/* Reply composer */}
              {showReply && (
                <ReplyBox postId={postId} parentId={comment.id} authorName={authorDisplay}
                  onDone={() => { setShowReply(false); onRefresh() }} />
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Replies ── */}
      {/*
        depth 0, 1, 2 (level 1–3) → indented ml-10 with curved connector, no @mention
        depth >= 2 (level 4+)     → flat, no indent, no connector, with @mention
      */}
      {!collapsed && hasReplies && (
        depth < 2 ? (
          /* Level 1–3: indented with connector, no @mention */
          <div className="ml-10">
            {comment.replies.map((reply, index) => {
              const isLast = index === comment.replies.length - 1

              return (
                <div
                  key={reply.id}
                  className={cn('relative', !isLast && 'pb-2')}
                >
                  {/* Vertical spine — same x-axis as parent thread line (w-8 center) */}
                  {!isLast ? (
                    <div className="pointer-events-none absolute -left-6 top-0 bottom-0 w-0.5 rounded-full bg-gray-200" />
                  ) : (
                    <div className="pointer-events-none absolute -left-6 top-0 h-1.5 w-0.5 rounded-full bg-gray-200" />
                  )}

                  <div className="relative pl-3">
                    {/* Elbow — horizontal at avatar center (top-4), no border-l (spine handles vertical) */}
                    <div className="pointer-events-none absolute -left-6 top-1.5 h-2.5 w-9 rounded-bl-[10px] border-b-2 border-gray-200" />
                    <CommentCard
                      comment={reply}
                      postId={postId}
                      onRefresh={onRefresh}
                      depth={depth + 1}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Level 4+: flat, no indent, no connector, with @mention */
          <div className="mt-0.5">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="mb-2">
                <CommentCard
                  comment={reply}
                  postId={postId}
                  onRefresh={onRefresh}
                  depth={depth + 1}
                  replyToName={comment.isAnonymous ? 'Ẩn danh' : comment.author}
                />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

/* ── Main section ── */
export function CommentSection({ postId }: { postId: string }) {
  const { user, requireAuth }         = useAuth()
  const [comments, setComments]       = useState<DiscussionComment[]>([])
  const [loading, setLoading]         = useState(true)
  const [content, setContent]         = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [inputExpanded, setInputExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchComments = useCallback(async () => {
    const token = user ? await getIdToken() : null
    const res  = await fetch(`/api/discussions/${postId}/comments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json()
    setComments(data.comments ?? [])
    setLoading(false)
  }, [postId, user])

  useEffect(() => { fetchComments() }, [fetchComments])

  function handleInputClick() {
    if (!user) {
      requireAuth(() => { setInputExpanded(true); setTimeout(() => textareaRef.current?.focus(), 50) })
    } else {
      setInputExpanded(true)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    requireAuth(() => doSubmit())
  }
  async function doSubmit() {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      const token = await getIdToken()
      await fetch(`/api/discussions/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ content: content.trim() }),
      })
      setContent('')
      setInputExpanded(false)
      await fetchComments()
    } finally { setSubmitting(false) }
  }

  const tree = buildTree(comments)

  return (
    <div>
      {/* "Join the conversation" */}
      <div className="mb-6">
        {!inputExpanded ? (
          <button onClick={handleInputClick}
            className="w-full rounded-full border border-gray-200 px-5 py-2.5 text-left text-sm text-gray-400 transition-colors hover:border-gray-300">
            Tham gia bình luận...
          </button>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea ref={textareaRef} rows={4} value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tham gia bình luận..."
              className="w-full resize-none rounded-xl border border-gray-200 px-5 py-3.5 text-[14px] outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => { setInputExpanded(false); setContent('') }}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
                Huỷ
              </button>
              <button type="submit" disabled={submitting || !content.trim()}
                className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50">
                {submitting && <Loader2 size={13} className="animate-spin" />}
                Bình luận
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Sort */}
      {!loading && comments.length > 0 && (
        <div className="mb-5 flex items-center gap-1 text-[13px] text-gray-500">
          <span>Sắp xếp:</span>
          <button className="flex items-center gap-0.5 font-semibold text-gray-800 hover:underline">
            Mới nhất
            <svg fill="currentColor" height="12" viewBox="0 0 20 20" width="12" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 8l5 5 5-5H5z" />
            </svg>
          </button>
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : tree.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-2 text-3xl">💬</p>
          <p className="font-semibold text-gray-800">Chưa có bình luận nào</p>
          <p className="mt-1 text-sm text-gray-400">Hãy là người đầu tiên chia sẻ!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tree.map((comment) => (
            <CommentCard key={comment.id} comment={comment} postId={postId} onRefresh={fetchComments} />
          ))}
        </div>
      )}
    </div>
  )
}
