'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/profile-types'
import type { DiscussionTopic } from '@/lib/discussion-types'

export type DiscussionView = 'posts' | 'recent-comments' | 'search' | 'moderation' | 'user-management' | 'topic-management' | 'blog-management'

interface SidebarProps {
  activeCategory: string | null
  onCategoryChange: (cat: string | null) => void
  onNewThread: () => void
  userRole?: UserRole | null
  activeView: DiscussionView
  onViewChange: (view: DiscussionView) => void
}

function TopicIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={className ?? 'size-[14px]'}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d={path}
      />
    </svg>
  )
}

export function DiscussionsSidebar({
  activeCategory,
  onCategoryChange,
  onNewThread,
  userRole,
  activeView,
  onViewChange,
}: SidebarProps) {
  const isMod = userRole === 'moderator' || userRole === 'admin'
  const isAdmin = userRole === 'admin'

  const [topics, setTopics] = useState<DiscussionTopic[]>([])
  const [loadingTopics, setLoadingTopics] = useState(true)

  useEffect(() => {
    fetch('/api/topics')
      .then((r) => r.json())
      .then((data) => setTopics(data.topics ?? []))
      .catch(() => setTopics([]))
      .finally(() => setLoadingTopics(false))
  }, [])

  function handleCategoryClick(cat: string | null) {
    onViewChange('posts')
    onCategoryChange(cat)
  }

  return (
    <aside className="hidden md:flex w-[300px] min-w-[300px] flex-col gap-0.5 sticky top-[84px] max-h-[calc(100vh-104px)] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-8">

      {/* ── Main nav ── */}
      <div className="flex flex-col">
        <button
          onClick={() => handleCategoryClick(null)}
          className={cn(
            'flex items-center gap-4 rounded-lg px-4 py-3 text-base text-gray-700 transition-colors hover:bg-gray-100',
            activeView === 'posts' && activeCategory === null && 'bg-gray-100 font-semibold text-gray-900'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6 flex-shrink-0 text-gray-500" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Tất cả bài viết
        </button>

        <button
          onClick={() => onViewChange('recent-comments')}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-base text-gray-700 transition-colors hover:bg-gray-100',
            activeView === 'recent-comments' && 'bg-gray-100 font-semibold text-gray-900',
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-6 flex-shrink-0 text-gray-500">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9.5h4M8 13h7m-3 8a9 9 0 1 0-8.342-5.616c.081.2.122.3.14.381a1 1 0 0 1 .024.219c0 .083-.015.173-.045.353l-.593 3.558c-.062.373-.093.56-.035.694a.5.5 0 0 0 .262.262c.135.058.321.027.694-.035l3.558-.593c.18-.03.27-.045.353-.045.081 0 .14.006.219.024.08.018.18.059.38.14A9 9 0 0 0 12 21" />
          </svg>
          Bình luận gần đây
        </button>

        <button
          onClick={() => onViewChange('search')}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-base text-gray-700 transition-colors hover:bg-gray-100',
            activeView === 'search' && 'bg-gray-100 font-semibold text-gray-900',
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-6 flex-shrink-0 text-gray-500">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0" />
          </svg>
          Tìm kiếm bài viết
        </button>

        <button
          onClick={onNewThread}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-base text-gray-700 transition-colors hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="size-6 flex-shrink-0 text-gray-500">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.667" d="M10 11.25v-5m-2.5 2.5h5M5.833 15v1.946c0 .444 0 .666.091.78.08.1.2.157.326.157.146 0 .32-.139.666-.416l1.988-1.59c.406-.325.61-.488.836-.603a2.5 2.5 0 0 1 .634-.223c.25-.051.51-.051 1.03-.051H13.5c1.4 0 2.1 0 2.635-.273a2.5 2.5 0 0 0 1.092-1.092C17.5 13.1 17.5 12.4 17.5 11V6.5c0-1.4 0-2.1-.273-2.635a2.5 2.5 0 0 0-1.092-1.093C15.6 2.5 14.9 2.5 13.5 2.5h-7c-1.4 0-2.1 0-2.635.272a2.5 2.5 0 0 0-1.093 1.093C2.5 4.4 2.5 5.1 2.5 6.5v5.167c0 .775 0 1.162.085 1.48a2.5 2.5 0 0 0 1.768 1.768c.318.085.705.085 1.48.085" />
          </svg>
          Đăng bài mới
        </button>
      </div>

      {/* ── Topic Forums ── */}
      <div className="mt-8 flex flex-col">
        <div className="mb-2 flex items-center justify-between px-4">
          <h3 className="text-sm font-medium text-gray-500">Chủ đề thảo luận</h3>
          {isAdmin && (
            <button
              onClick={() => onViewChange('topic-management')}
              title="Quản lý chủ đề"
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-3.5">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>

        {loadingTopics ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mx-3 my-1 flex items-center gap-3 rounded-lg px-2 py-2.5">
                <div className="h-7 w-7 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-3.5 w-28 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </>
        ) : (
          topics.map(({ id, label, value, iconPath, bg, fg }) => (
            <button
              key={id}
              onClick={() => handleCategoryClick(activeCategory === value ? null : value)}
              className={cn(
                'flex items-center gap-4 rounded-lg px-4 py-3 text-base text-gray-700 transition-colors hover:bg-gray-100',
                activeView === 'posts' && activeCategory === value && 'bg-gray-100 font-semibold text-gray-900'
              )}
            >
              <span className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg', bg, fg)}>
                <TopicIcon path={iconPath} />
              </span>
              {label}
            </button>
          ))
        )}
      </div>

      {/* ── Moderator section ── */}
      {isMod && (
        <div className="mt-8 flex flex-col">
          <h3 className="mb-2 px-4 text-sm font-medium text-gray-500">Kiểm duyệt</h3>
          <button
            onClick={() => onViewChange('moderation')}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-base text-gray-700 transition-colors hover:bg-gray-100',
              activeView === 'moderation' && 'bg-gray-100 font-semibold text-gray-900'
            )}
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-[14px]">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </span>
            Quản lý bài viết
          </button>
        </div>
      )}

      {/* ── Admin section ── */}
      {isAdmin && (
        <div className="mt-4 flex flex-col">
          <h3 className="mb-2 px-4 text-sm font-medium text-gray-500">Quản trị</h3>
          <button
            onClick={() => onViewChange('topic-management')}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-base text-gray-700 transition-colors hover:bg-gray-100',
              activeView === 'topic-management' && 'bg-gray-100 font-semibold text-gray-900'
            )}
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-[14px]">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 6h.008v.008H6V6Z" />
              </svg>
            </span>
            Quản lý chủ đề
          </button>
          <button
            onClick={() => onViewChange('user-management')}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-base text-gray-700 transition-colors hover:bg-gray-100',
              activeView === 'user-management' && 'bg-gray-100 font-semibold text-gray-900'
            )}
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-[14px]">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </span>
            Quản lý người dùng
          </button>
          <button
            onClick={() => onViewChange('blog-management')}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-base text-gray-700 transition-colors hover:bg-gray-100',
              activeView === 'blog-management' && 'bg-gray-100 font-semibold text-gray-900'
            )}
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-[14px]">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
              </svg>
            </span>
            Quản lý blog
          </button>
        </div>
      )}
    </aside>
  )
}
