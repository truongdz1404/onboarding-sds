'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { PostCard } from '@/components/discussions/post-card'
import { ProfileOverview } from '@/components/profile/profile-overview'
import { PROFILE_TABS, type ProfileTab, type UserProfile } from '@/lib/profile-types'
import type { DiscussionPost } from '@/lib/discussion-types'
import { cn } from '@/lib/utils'

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

const EMPTY_MESSAGES: Record<ProfileTab, { emoji: string; title: string; desc: string }> = {
  overview:   { emoji: '👤', title: '', desc: '' },
  posts:      { emoji: '📝', title: 'Chưa có bài viết nào', desc: 'Hãy bắt đầu một thread mới!' },
  comments:   { emoji: '💬', title: 'Chưa bình luận bài nào', desc: 'Tham gia thảo luận trong diễn đàn.' },
  saved:      { emoji: '🔖', title: 'Chưa lưu bài nào', desc: 'Nhấn «Lưu» trên bài viết để lưu lại.' },
  history:    { emoji: '🕐', title: 'Chưa có lịch sử', desc: 'Các bài bạn xem sẽ hiện ở đây.' },
  hidden:     { emoji: '📦', title: 'Chưa có bài ẩn', desc: 'Các bài bạn lưu trữ sẽ hiện ở đây.' },
  upvoted:    { emoji: '👍', title: 'Chưa thích bài nào', desc: 'Các bài bạn upvote sẽ hiện ở đây.' },
  downvoted:  { emoji: '👎', title: 'Chưa không thích bài nào', desc: 'Các bài bạn downvote sẽ hiện ở đây.' },
  pending:    { emoji: '⏳', title: 'Không có bài nào chờ duyệt', desc: 'Bài viết chờ kiểm duyệt sẽ hiện ở đây.' },
}

export default function ProfilePageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, requireAuth } = useAuth()

  const tabParam = (searchParams.get('tab') ?? 'overview') as ProfileTab
  const activeTab = PROFILE_TABS.some((t) => t.id === tabParam) ? tabParam : 'overview'

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(false)

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true)
    try {
      const token = await getIdToken()
      const res = await fetch('/api/profile', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
      }
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  const fetchPosts = useCallback(async (tab: ProfileTab) => {
    if (tab === 'overview') return
    setLoadingPosts(true)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/profile/posts?tab=${tab}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts ?? [])
      }
    } finally {
      setLoadingPosts(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      requireAuth(() => {})
      return
    }
    fetchProfile()
  }, [user, authLoading, fetchProfile, requireAuth])

  useEffect(() => {
    if (!user || activeTab === 'overview') return
    fetchPosts(activeTab)
  }, [user, activeTab, fetchPosts])

  function setTab(tab: ProfileTab) {
    router.push(`/profile?tab=${tab}`, { scroll: false })
  }

  function handlePostArchived(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  if (authLoading || loadingProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center pt-28 text-center">
        <p className="text-lg font-semibold text-gray-800">Vui lòng đăng nhập để xem hồ sơ</p>
      </div>
    )
  }

  const initials = profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
  const empty = EMPTY_MESSAGES[activeTab]

  return (
    <div className="min-h-screen bg-[#f6f7f8] pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">

        <div className="mb-6 rounded-2xl border border-[#f0f0f0] bg-white px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-100">
              {profile.photoURL ? (
                <Image src={profile.photoURL} alt="" width={64} height={64} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-primary text-xl font-bold text-white">{initials}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name || user.displayName || 'Người dùng'}</h1>
              <p className="text-sm text-gray-500">u/{profile.username}</p>
              {profile.headline && <p className="mt-1 text-sm text-gray-600">{profile.headline}</p>}
            </div>
          </div>
        </div>

        <div className="mb-4 flex gap-1 overflow-x-auto rounded-full border border-[#f0f0f0] bg-white p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PROFILE_TABS.map((tab) => (
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

        {activeTab === 'overview' ? (
          <ProfileOverview profile={profile} onUpdate={setProfile} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white">
            {loadingPosts ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="mb-2 text-4xl">{empty.emoji}</p>
                <p className="font-semibold text-gray-800">{empty.title}</p>
                <p className="mt-1 text-sm text-gray-400">{empty.desc}</p>
              </div>
            ) : (
              <div className="divide-y divide-[#f0f0f0]">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userVote={post.userVote ?? null}
                    onArchived={() => handlePostArchived(post.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
