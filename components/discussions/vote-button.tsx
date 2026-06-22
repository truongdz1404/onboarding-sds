'use client'

import { useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

interface VoteButtonProps {
  count: number
  postId: string
  voted?: boolean
  size?: 'sm' | 'lg' | 'detail'
}

export function VoteButton({ count, postId, voted: initialVoted = false, size = 'sm' }: VoteButtonProps) {
  const { requireAuth } = useAuth()
  const [voted, setVoted]               = useState(initialVoted)
  const [currentCount, setCurrentCount] = useState(count)
  const [loading, setLoading]           = useState(false)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    requireAuth(() => doVote())
  }

  async function doVote() {
    if (loading) return
    setLoading(true)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/discussions/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (res.ok) {
        setVoted(data.voted)
        setCurrentCount((c) => (data.voted ? c + 1 : c - 1))
      }
    } finally {
      setLoading(false)
    }
  }

  /* Detail page — PH-style boxed vote */
  if (size === 'detail') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          'flex flex-col items-center gap-1 rounded-xl border px-4 py-2.5 font-semibold transition-all disabled:opacity-60',
          voted
            ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20'
            : 'border-[#e5e7eb] bg-white text-[#6b7280] hover:border-primary hover:text-primary',
        )}
      >
        <ChevronUp size={17} strokeWidth={2.5} />
        <span className="text-xs leading-none">{currentCount}</span>
      </button>
    )
  }

  /* Legacy large size (kept for backward compat) */
  if (size === 'lg') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          'flex flex-col items-center justify-center gap-1 rounded-xl border-2 font-bold transition-all duration-150 disabled:opacity-60',
          'h-20 w-16 text-lg',
          voted
            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25'
            : 'border-border bg-white text-foreground hover:border-primary hover:text-primary',
        )}
      >
        <ChevronUp size={22} strokeWidth={2.5} />
        <span className="text-base leading-none">{currentCount}</span>
      </button>
    )
  }

  /* Default compact (used in post-card) */
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 rounded-lg border transition-all duration-150 disabled:opacity-60',
        'h-[52px] w-[44px] text-xs font-bold',
        voted
          ? 'border-primary bg-primary text-white shadow-sm shadow-primary/30'
          : 'border-[#e5e7eb] bg-white text-foreground hover:border-primary hover:text-primary',
      )}
    >
      <ChevronUp size={15} strokeWidth={2.5} />
      <span>{currentCount}</span>
    </button>
  )
}
