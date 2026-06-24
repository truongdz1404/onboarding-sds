'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { PostCard } from './post-card'
import type { DiscussionPost } from '@/lib/discussion-types'
import { cn } from '@/lib/utils'

type ModerationTab = 'pending' | 'approved'

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

export function ModerationView() {
  const [tab, setTab] = useState<ModerationTab>('pending')
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPosts = useCallback(async (status: ModerationTab) => {
    setLoading(true)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/discussions/pending?status=${status}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setPosts(data.posts ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(tab)
  }, [tab, fetchPosts])

  async function handleModerate(postId: string, status: 'approved' | 'rejected') {
    setActionLoading(postId)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/discussions/${postId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Banner */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#f0f0f0] bg-white px-6 py-5 shadow-sm">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
          <ShieldCheck size={24} strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-bold text-[#1f2937]" style={{ fontSize: '17px', lineHeight: '1.3' }}>
            Kiểm duyệt bài viết
          </h1>
          <p className="mt-0.5 text-[13px] text-[#6b7280]">
            Xem xét và phê duyệt các bài viết mới
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative mb-0 flex items-center border-b border-[#f0f0f0] pb-0">
        {(['pending', 'approved'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-1 pb-3 pr-5 text-[13px] font-semibold transition-colors',
              tab === t
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-[#6b7280] hover:text-[#374151]',
            )}
          >
            {t === 'pending' ? 'Chờ phê duyệt' : 'Đã phê duyệt'}
          </button>
        ))}
        {!loading && (
          <span className="ml-auto pb-3 text-[12px] text-[#9ca3af]">{posts.length} bài</span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-amber-500" size={24} />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-28 text-center">
          <p className="mb-3 text-5xl">{tab === 'pending' ? '✅' : '📋'}</p>
          <p className="text-xl font-bold text-[#1f2937]">
            {tab === 'pending' ? 'Không có bài nào chờ duyệt' : 'Chưa có bài nào được duyệt'}
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post} userVote={post.userVote ?? null} />
              {tab === 'pending' && (
                <div className="flex items-center gap-2 px-4 pb-3 -mt-1">
                  <button
                    onClick={() => handleModerate(post.id, 'approved')}
                    disabled={actionLoading === post.id}
                    className="flex items-center gap-1.5 rounded-full bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === post.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-3.5">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                    Phê duyệt
                  </button>
                  <button
                    onClick={() => handleModerate(post.id, 'rejected')}
                    disabled={actionLoading === post.id}
                    className="flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === post.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-3.5">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    )}
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
