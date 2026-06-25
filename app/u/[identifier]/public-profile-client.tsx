'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Link2, CalendarDays } from 'lucide-react'
import { PostCard } from '@/components/discussions/post-card'
import type { DiscussionPost } from '@/lib/discussion-types'
import type { ProfileLink } from '@/lib/profile-types'
import { cn } from '@/lib/utils'

type PublicTab = 'overview' | 'posts' | 'comments'

const TABS: { id: PublicTab; label: string }[] = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'posts', label: 'Bài viết' },
  { id: 'comments', label: 'Bình luận' },
]

interface PublicProfile {
  uid: string
  name: string
  username: string
  headline: string
  about: string
  links: ProfileLink[]
  photoURL?: string
  joinedAt?: number | null
  postCount: number
  commentCount: number
}

export function PublicProfileClient({ identifier }: { identifier: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = (searchParams.get('tab') ?? 'overview') as PublicTab
  const activeTab = TABS.some((t) => t.id === tabParam) ? tabParam : 'overview'

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/users/${encodeURIComponent(identifier)}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.ok ? r.json() : null
      })
      .then((data) => { if (data?.profile) setProfile(data.profile) })
      .finally(() => setLoading(false))
  }, [identifier])

  const fetchTabPosts = useCallback(async (tab: PublicTab) => {
    if (tab === 'overview') return
    setLoadingPosts(true)
    try {
      const endpoint = tab === 'posts' ? 'posts' : 'comments'
      const res = await fetch(`/api/users/${encodeURIComponent(identifier)}/${endpoint}`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts ?? [])
      }
    } finally {
      setLoadingPosts(false)
    }
  }, [identifier])

  useEffect(() => {
    if (!profile) return
    if (activeTab !== 'overview') {
      fetchTabPosts(activeTab)
    } else {
      setPosts([])
    }
  }, [activeTab, profile, fetchTabPosts])

  function setTab(tab: PublicTab) {
    router.push(`/u/${identifier}?tab=${tab}`, { scroll: false })
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center pt-28 text-center">
        <p className="text-5xl mb-4">🕵️</p>
        <p className="text-lg font-semibold text-gray-800">Không tìm thấy người dùng này</p>
        <p className="mt-1 text-sm text-gray-400">Người dùng có thể đã đổi tên hoặc không tồn tại.</p>
      </div>
    )
  }

  const initials = profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className="min-h-screen bg-[#f6f7f8] pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-6 rounded-2xl border border-[#f0f0f0] bg-white px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-100">
              {profile.photoURL ? (
                <Image
                  src={profile.photoURL}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-primary text-xl font-bold text-white">
                  {initials}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-sm text-gray-500">u/{profile.username}</p>
              {profile.headline && (
                <p className="mt-1 text-sm text-gray-600">{profile.headline}</p>
              )}
              {profile.joinedAt && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                  <CalendarDays size={12} />
                  Tham gia{' '}
                  {new Date(profile.joinedAt).toLocaleDateString('vi-VN', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-6 border-t border-gray-50 pt-4">
            <div>
              <p className="text-lg font-bold text-gray-900">{profile.postCount}</p>
              <p className="text-xs text-gray-400">Bài viết</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{profile.commentCount}</p>
              <p className="text-xs text-gray-400">Bình luận</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-full border border-[#f0f0f0] bg-white p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                'flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
                activeTab === tab.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' ? (
          <div className="rounded-2xl border border-[#f0f0f0] bg-white p-6">
            {profile.about && (
              <div className="mb-5">
                <h3 className="mb-1.5 text-sm font-semibold text-gray-700">Giới thiệu</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{profile.about}</p>
              </div>
            )}
            {profile.links.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Liên kết</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Link2 size={11} />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {!profile.about && profile.links.length === 0 && (
              <p className="text-sm text-gray-400">Người dùng chưa có giới thiệu.</p>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white">
            {loadingPosts ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="mb-2 text-4xl">{activeTab === 'posts' ? '📝' : '💬'}</p>
                <p className="font-semibold text-gray-800">
                  {activeTab === 'posts' ? 'Chưa có bài viết nào' : 'Chưa bình luận bài nào'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f0f0f0]">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} userVote={post.userVote ?? null} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
