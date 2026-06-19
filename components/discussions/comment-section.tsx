'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Send, Loader2 } from 'lucide-react'
import { timeAgo } from '@/lib/time-utils'
import { useAuth } from '@/lib/auth-context'
import type { DiscussionComment } from '@/lib/discussion-types'

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user, requireAuth } = useAuth()
  const [comments, setComments] = useState<DiscussionComment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/discussions/${postId}/comments`)
    const data = await res.json()
    setComments(data.comments ?? [])
    setLoading(false)
  }, [postId])

  useEffect(() => { fetchComments() }, [fetchComments])

  function handleSubmitAttempt(e: React.FormEvent) {
    e.preventDefault()
    requireAuth(() => doSubmit())
  }

  async function doSubmit() {
    if (!user || !content.trim() || submitting) return
    setSubmitting(true)
    try {
      const token = await getIdToken()
      await fetch(`/api/discussions/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: content.trim() }),
      })
      setContent('')
      await fetchComments()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div id="comments">
      <h2 className="mb-6 text-lg font-bold text-text-dark">
        {comments.length > 0 ? `${comments.length} bình luận` : 'Bình luận'}
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmitAttempt} className="mb-8 flex gap-3">
        {user ? (
          user.photoURL ? (
            <img src={user.photoURL} alt="" className="h-9 w-9 flex-shrink-0 rounded-full" />
          ) : (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {user.displayName?.[0] ?? 'U'}
            </div>
          )
        ) : (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
            ?
          </div>
        )}

        <div className="flex flex-1 items-end gap-2 rounded-xl border border-border bg-white px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <textarea
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            rows={1}
            placeholder={user ? 'Viết bình luận của bạn...' : 'Đăng nhập để bình luận...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => { if (!user) requireAuth(() => {}) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmitAttempt(e as unknown as React.FormEvent)
              }
            }}
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-opacity disabled:opacity-40"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </form>

      {/* Comment list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                <div className="h-12 animate-pulse rounded-xl bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-3xl mb-2">💬</p>
          <p className="font-semibold text-text-dark">Chưa có bình luận nào</p>
          <p className="mt-1 text-sm text-muted-foreground">Hãy là người đầu tiên chia sẻ!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              {c.photoURL && !c.isAnonymous ? (
                <div className="relative h-9 w-9 flex-shrink-0">
                  <Image src={c.photoURL} alt={c.author} fill className="rounded-full object-cover" />
                </div>
              ) : (
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {c.isAnonymous ? '?' : c.authorInitials}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-dark">
                    {c.isAnonymous ? 'Ẩn danh' : c.author}
                  </span>
                  <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
