'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Clock, TrendingUp, LogOut, LogIn } from 'lucide-react'
import { PostCard } from '@/components/discussions/post-card'
import { CreatePostModal } from '@/components/discussions/create-post-modal'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import type { DiscussionPost } from '@/lib/discussion-types'
import Image from 'next/image'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất', icon: Clock },
  { value: 'top', label: 'Nổi bật', icon: TrendingUp },
]

export default function DiscussionsPage() {
  const { user, loading: authLoading, signOut, requireAuth } = useAuth()
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [sort, setSort] = useState('newest')
  const [fetching, setFetching] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchPosts = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch(`/api/discussions?sort=${sort}`)
      const data = await res.json()
      setPosts(data.posts ?? [])
    } finally {
      setFetching(false)
    }
  }, [sort])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  function openModal() {
    requireAuth(() => setShowModal(true))
  }

  return (
    <>
      {/* ── Header / Hero ──────────────────────────────── */}
      <div className="border-b border-[#f0f0f0] bg-white pt-24 pb-0">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between pb-5">
            <div>
              <h1
                className="font-bold text-text-dark"
                style={{
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                }}
              >
                Thảo luận nội bộ
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Chia sẻ, hỏi đáp cùng đồng nghiệp SoftDreams
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* User avatar / login */}
              {!authLoading && (
                user ? (
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full border border-border" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {user.displayName?.[0] ?? 'U'}
                      </div>
                    )}
                    <button
                      onClick={signOut}
                      className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <LogOut size={13} />
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => requireAuth(() => {})}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <LogIn size={15} />
                    <span className="hidden sm:inline">Đăng nhập</span>
                  </button>
                )
              )}

              <button
                onClick={openModal}
                className="btn-primary !h-9 !px-4 !text-sm"
              >
                <Plus size={16} />
                Đăng bài
              </button>
            </div>
          </div>

          {/* Sort tabs */}
          <div className="flex items-center gap-0 border-b border-transparent">
            {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSort(value)}
                className={cn(
                  'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
                  sort === value
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
            <span className="ml-auto pb-2 text-xs text-muted-foreground">
              {!fetching && `${posts.length} bài`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Post feed ──────────────────────────────────── */}
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl">
          {fetching ? (
            /* Skeleton */
            <div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-[#f0f0f0] px-4 py-4 sm:px-6">
                  <div className="h-[52px] w-[44px] animate-pulse rounded-lg bg-gray-100" />
                  <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-28 text-center">
              <p className="mb-3 text-5xl">💬</p>
              <p className="text-xl font-bold text-text-dark">Chưa có bài nào</p>
              <p className="mt-2 text-muted-foreground">Hãy là người đầu tiên chia sẻ!</p>
              <button onClick={openModal} className="btn-primary mt-6">
                <Plus size={18} /> Đăng bài đầu tiên
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} voted={false} />
            ))
          )}

          {/* Footer spacer */}
          {posts.length > 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Đã xem hết {posts.length} bài</p>
            </div>
          )}
        </div>
      </div>

      <CreatePostModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={fetchPosts}
      />
    </>
  )
}
