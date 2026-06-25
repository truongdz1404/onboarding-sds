'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Loader2, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HoverProfile {
  uid: string
  name: string
  username: string
  headline: string
  photoURL?: string
  joinedAt?: number | null
  postCount: number
  commentCount: number
}

interface UserHoverCardProps {
  uid: string
  children: React.ReactNode
  className?: string
}

export function UserHoverCard({ uid, children, className }: UserHoverCardProps) {
  const [show, setShow] = useState(false)
  const [profile, setProfile] = useState<HoverProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fetchedRef = useRef(false)

  const fetchProfile = useCallback(async () => {
    if (!uid || fetchedRef.current) return
    fetchedRef.current = true
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(uid)}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
      }
    } finally {
      setLoading(false)
    }
  }, [uid])

  function handleMouseEnter() {
    if (!uid) return
    timerRef.current = setTimeout(() => {
      setShow(true)
      fetchProfile()
    }, 300)
  }

  function handleMouseLeave() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setShow(false)
  }

  const initials = profile
    ? profile.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '?'
    : ''

  return (
    <span
      className={cn('relative inline-flex items-center gap-x-1.5', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/u/${uid}`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-x-1.5"
      >
        {children}
      </Link>

      {show && (
        <div
          className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-gray-100 bg-white p-4 shadow-xl"
          onMouseEnter={() => {
            if (timerRef.current) clearTimeout(timerRef.current)
            setShow(true)
          }}
          onMouseLeave={() => setShow(false)}
        >
          {loading && !profile ? (
            <div className="flex justify-center py-3">
              <Loader2 size={16} className="animate-spin text-gray-300" />
            </div>
          ) : profile ? (
            <>
              <div className="flex items-center gap-3">
                <Link href={`/u/${profile.username}`} onClick={(e) => e.stopPropagation()}>
                  {profile.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
                      {initials}
                    </span>
                  )}
                </Link>
                <div>
                  <Link
                    href={`/u/${profile.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    {profile.name}
                  </Link>
                  <p className="text-xs text-gray-500">u/{profile.username}</p>
                  {profile.joinedAt && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                      <CalendarDays size={10} />
                      Tham gia{' '}
                      {new Date(profile.joinedAt).toLocaleDateString('vi-VN', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>

              {profile.headline && (
                <p className="mt-2 line-clamp-2 text-[12px] text-gray-600">{profile.headline}</p>
              )}

              <div className="mt-3 flex gap-5 border-t border-gray-50 pt-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">{profile.postCount}</p>
                  <p className="text-[11px] text-gray-400">Bài viết</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{profile.commentCount}</p>
                  <p className="text-[11px] text-gray-400">Bình luận</p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </span>
  )
}
