'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, ChevronDown, MessageSquare } from 'lucide-react'
import { PostCard } from '@/components/discussions/post-card'
import { CommentIcon } from '@/components/icons/comment-icon'
import { DiscussionsSidebar, type DiscussionView } from '@/components/discussions/discussions-sidebar'
import { ModerationView } from '@/components/discussions/moderation-view'
import { UserManagementView } from '@/components/discussions/user-management-view'
import { TopicManagementView } from '@/components/discussions/topic-management-view'
import { RecentCommentsView } from '@/components/discussions/recent-comments-view'
import { SearchView } from '@/components/discussions/search-view'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import type { DiscussionPost } from '@/lib/discussion-types'

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'top',    label: 'Nổi bật' },
]

function DiscussionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, requireAuth, userRole } = useAuth()
  const [posts, setPosts]             = useState<DiscussionPost[]>([])
  const [sort, setSort]               = useState('newest')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [fetching, setFetching]       = useState(true)

  const viewParam = searchParams.get('view') as DiscussionView | null
  const VALID_VIEWS: DiscussionView[] = ['posts', 'recent-comments', 'search', 'moderation', 'user-management', 'topic-management']
  const [activeView, setActiveView]   = useState<DiscussionView>(
    VALID_VIEWS.includes(viewParam as DiscussionView) ? (viewParam as DiscussionView) : 'posts'
  )

  const fetchPosts = useCallback(async () => {
    setFetching(true)
    try {
      const token = user ? await getIdToken() : null
      const res = await fetch(`/api/discussions?sort=${sort}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setPosts(data.posts ?? [])
    } finally {
      setFetching(false)
    }
  }, [sort, user])

  useEffect(() => {
    if (activeView === 'posts') fetchPosts()
  }, [fetchPosts, activeView])

  function openNewThread() {
    requireAuth(() => router.push('/discussions/new'))
  }

  function handleViewChange(view: DiscussionView) {
    setActiveView(view)
  }

  function handleCategoryChange(cat: string | null) {
    setActiveCategory(cat)
    setActiveView('posts')
  }

  const displayed = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts

  return (
    <>
      <div className="min-h-screen bg-white pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-12">

            {/* ── Sidebar ── */}
            <DiscussionsSidebar
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              onNewThread={openNewThread}
              userRole={userRole}
              activeView={activeView}
              onViewChange={handleViewChange}
            />

            {/* ── Recent comments view ── */}
            {activeView === 'recent-comments' && <RecentCommentsView />}

            {/* ── Search view ── */}
            {activeView === 'search' && <SearchView />}

            {/* ── Moderation view ── */}
            {activeView === 'moderation' && <ModerationView />}

            {/* ── User management view ── */}
            {activeView === 'user-management' && <UserManagementView />}

            {/* ── Topic management view ── */}
            {activeView === 'topic-management' && <TopicManagementView />}

            {/* ── Main posts content ── */}
            {activeView === 'posts' && (
              <div className="flex-1 min-w-0">

                {/* Banner card */}
                <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#f0f0f0] bg-white px-6 py-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/30">
                      <MessageSquare size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <h1 className="font-bold text-[#1f2937]" style={{ fontSize: '17px', lineHeight: '1.3' }}>
                        {activeCategory ? `p/${activeCategory.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}` : 'Kết nối cùng đồng nghiệp SoftDreams'}
                      </h1>
                      <p className="mt-0.5 text-[13px] text-[#6b7280]">
                        {activeCategory
                          ? `${displayed.length} bài trong chủ đề này`
                          : 'Bắt đầu một thread, tham gia thảo luận, cập nhật thông tin.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={openNewThread}
                    className="flex flex-shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    Tạo bài viết
                  </button>
                </div>

                {/* Sort tabs */}
                <div className="relative mb-0 flex items-center border-b border-[#f0f0f0] pb-0">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSort(opt.value)}
                      className={cn(
                        'flex items-center gap-1.5 border-b-2 px-1 pb-3 pr-4 text-[13px] font-semibold transition-colors',
                        sort === opt.value
                          ? 'border-primary text-primary'
                          : 'border-transparent text-[#6b7280] hover:text-[#374151]',
                      )}
                    >
                      {opt.label}
                      {sort === opt.value && <ChevronDown size={13} />}
                    </button>
                  ))}
                  {!fetching && (
                    <span className="ml-auto pb-3 text-[12px] text-[#9ca3af]">
                      {displayed.length} bài
                    </span>
                  )}
                </div>

                {/* Thread list */}
                {fetching ? (
                  <div>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex gap-3 rounded-xl p-4">
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
                          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                          <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                        </div>
                        <div className="flex flex-shrink-0 gap-1.5">
                          <div className="h-14 w-12 animate-pulse rounded-xl bg-gray-100" />
                          <div className="h-14 w-12 animate-pulse rounded-xl bg-gray-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="py-28 text-center">
                    <CommentIcon className="mx-auto mb-3 text-gray-400" width={48} height={48} />
                    <p className="text-xl font-bold text-[#1f2937]">
                      {activeCategory ? `Chưa có bài nào trong "${activeCategory}"` : 'Chưa có bài nào'}
                    </p>
                    <p className="mt-2 text-[#6b7280]">Hãy là người đầu tiên chia sẻ!</p>
                    <button
                      onClick={openNewThread}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      <Plus size={15} /> Tạo bài viết
                    </button>
                  </div>
                ) : (
                  displayed.map((post) => (
                    <PostCard key={post.id} post={post} userVote={post.userVote ?? null} />
                  ))
                )}

                {displayed.length > 0 && !fetching && (
                  <div className="py-10 text-center">
                    <p className="text-sm text-[#9ca3af]">Đã xem hết {displayed.length} bài</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function DiscussionsPage() {
  return (
    <Suspense>
      <DiscussionsContent />
    </Suspense>
  )
}
