'use client'

import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import Image from 'next/image'
import { LogOut } from 'lucide-react'

export function NavbarUser() {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let unsub: (() => void) | undefined
    import('@/lib/firebase-client').then(({ auth }) => {
      unsub = onAuthStateChanged(auth, setUser)
    })
    return () => unsub?.()
  }, [])

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!user) return null

  async function handleSignOut() {
    const { auth } = await import('@/lib/firebase-client')
    await signOut(auth)
    setOpen(false)
  }

  const initials = (user.displayName ?? user.email ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 overflow-hidden rounded-full border-2 border-transparent ring-1 ring-black/10 transition-all hover:ring-primary/40"
        aria-label="Tài khoản"
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName ?? ''}
            width={36}
            height={36}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-white">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-xl">
          {/* Profile info */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#f0f0f0]">
            <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt=""
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-white">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{user.displayName ?? 'Người dùng'}</p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <LogOut size={15} className="text-gray-400" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
