'use client'

import { cn } from '@/lib/utils'

interface SidebarProps {
  activeCategory: string | null
  onCategoryChange: (cat: string | null) => void
  onNewThread: () => void
}

const TOPICS = [
  {
    label: 'p/chung',
    value: 'Chung',
    bg: 'bg-sky-100',
    fg: 'text-sky-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-[14px]">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.485 0 4-4.03 4-9s-1.515-9-4-9m0 18c-2.485 0-4-4.03-4-9s1.515-9 4-9m-9 9h18" />
      </svg>
    ),
  },
  {
    label: 'p/ky-thuat',
    value: 'Kỹ thuật',
    bg: 'bg-violet-100',
    fg: 'text-violet-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-[14px]">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m16 18 4-4-4-4M8 6 4 10l4 4" />
      </svg>
    ),
  },
  {
    label: 'p/hoi-dap',
    value: 'Hỏi & Đáp',
    bg: 'bg-amber-100',
    fg: 'text-amber-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-[14px]">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
      </svg>
    ),
  },
  {
    label: 'p/gioi-thieu',
    value: 'Giới thiệu',
    bg: 'bg-green-100',
    fg: 'text-green-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-[14px]">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    label: 'p/san-pham',
    value: 'Sản phẩm',
    bg: 'bg-rose-100',
    fg: 'text-rose-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-[14px]">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m21 7.5-9-4.5L3 7.5m18 0-9 4.5m9-4.5v9l-9 4.5M3 7.5l9 4.5M3 7.5v9l9 4.5m0-9v9" />
      </svg>
    ),
  },
  {
    label: 'p/kinh-nghiem',
    value: 'Kinh nghiệm',
    bg: 'bg-teal-100',
    fg: 'text-teal-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-[14px]">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    label: 'p/hoat-dong',
    value: 'Hoạt động',
    bg: 'bg-orange-100',
    fg: 'text-orange-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-[14px]">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
]

export function DiscussionsSidebar({ activeCategory, onCategoryChange, onNewThread }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-[300px] min-w-[300px] flex-col gap-0.5 sticky top-[84px] max-h-[calc(100vh-104px)] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-8">

      {/* ── Main nav ── */}
      <div className="flex flex-col">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            'flex items-center gap-4 rounded-lg px-4 py-3 text-base text-gray-700 transition-colors hover:bg-gray-100',
            activeCategory === null && 'bg-gray-100 font-semibold text-gray-900'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6 flex-shrink-0 text-gray-500" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Tất cả bài viết
        </button>

        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-base text-gray-700 transition-colors hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-6 flex-shrink-0 text-gray-500">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9.5h4M8 13h7m-3 8a9 9 0 1 0-8.342-5.616c.081.2.122.3.14.381a1 1 0 0 1 .024.219c0 .083-.015.173-.045.353l-.593 3.558c-.062.373-.093.56-.035.694a.5.5 0 0 0 .262.262c.135.058.321.027.694-.035l3.558-.593c.18-.03.27-.045.353-.045.081 0 .14.006.219.024.08.018.18.059.38.14A9 9 0 0 0 12 21" />
          </svg>
          Bình luận gần đây
        </button>

        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-base text-gray-700 transition-colors hover:bg-gray-100">
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
        <h3 className="mb-2 px-4 text-sm font-medium text-gray-500">Chủ đề thảo luận</h3>
        {TOPICS.map(({ label, value, icon, bg, fg }) => (
          <button
            key={value}
            onClick={() => onCategoryChange(activeCategory === value ? null : value)}
            className={cn(
              'flex items-center gap-4 rounded-lg px-4 py-3 text-base text-gray-700 transition-colors hover:bg-gray-100',
              activeCategory === value && 'bg-gray-100 font-semibold text-gray-900'
            )}
          >
            <span className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg', bg, fg)}>
              {icon}
            </span>
            {label}
          </button>
        ))}
      </div>
    </aside>
  )
}
