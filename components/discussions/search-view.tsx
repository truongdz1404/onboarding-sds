'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { PostCard } from '@/components/discussions/post-card'
import { CommentIcon } from '@/components/icons/comment-icon'
import type { DiscussionPost } from '@/lib/discussion-types'

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().toLowerCase()
}

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

export function SearchView() {
  const [query, setQuery]         = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [allPosts, setAllPosts]   = useState<DiscussionPost[]>([])
  const [loading, setLoading]     = useState(false)
  const [loaded, setLoaded]       = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(id)
  }, [query])

  const loadPosts = useCallback(async () => {
    if (loaded || loading) return
    setLoading(true)
    try {
      const token = await getIdToken()
      const res = await fetch('/api/discussions?sort=newest', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setAllPosts(data.posts ?? [])
      setLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [loaded, loading])

  useEffect(() => {
    if (debouncedQuery.trim()) loadPosts()
  }, [debouncedQuery, loadPosts])

  const trimmed = debouncedQuery.trim().toLowerCase()
  const results = trimmed
    ? allPosts.filter((p) =>
        p.title.toLowerCase().includes(trimmed) ||
        stripHtml(p.description ?? '').includes(trimmed)
      )
    : []

  return (
    <div className="flex-1 min-w-0">
      {/* Search input */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm bài thảo luận..."
          className="w-full rounded-full border border-[#e5e7eb] bg-white py-2.5 pl-10 pr-4 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        {loading && (
          <Loader2
            size={13}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
          />
        )}
      </div>

      {/* Sort chip */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-[12px] font-semibold text-primary">
          Gần đây
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="size-3">
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </span>
      </div>

      {/* States */}
      {!trimmed ? (
        <div className="py-24 text-center">
          <Search size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-[14px] text-gray-400">Nhập từ khoá để tìm bài thảo luận</p>
        </div>
      ) : loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 size={24} className="animate-spin text-gray-300" />
        </div>
      ) : results.length === 0 ? (
        <div className="py-24 text-center">
          <CommentIcon width={36} height={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-[14px] text-gray-500">
            Không tìm thấy kết quả cho <strong className="text-gray-700">"{query}"</strong>
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-[12px] text-gray-400">{results.length} kết quả</p>
          {results.map((post) => (
            <PostCard key={post.id} post={post} userVote={post.userVote ?? null} />
          ))}
        </div>
      )}
    </div>
  )
}
