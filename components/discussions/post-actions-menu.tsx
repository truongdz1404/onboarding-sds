'use client'

import { useState, useEffect, useRef } from 'react'
import { Bookmark, Archive, Send, EyeOff, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { ConfirmDialog } from './confirm-dialog'
import { cn } from '@/lib/utils'

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

interface PostActionsMenuProps {
  postId: string
  creatorUid?: string
  initialSaved?: boolean
  isDraft?: boolean
  isArchived?: boolean
  isHiddenByMod?: boolean
  onSavedChange?: (saved: boolean) => void
  onArchived?: () => void
  onUnarchived?: () => void
  onHidden?: () => void
  onPublished?: () => void
  className?: string
  align?: 'left' | 'right'
}

export function PostActionsMenu({
  postId,
  creatorUid,
  initialSaved = false,
  isDraft = false,
  isArchived = false,
  isHiddenByMod = false,
  onSavedChange,
  onArchived,
  onUnarchived,
  onHidden,
  onPublished,
  className,
  align = 'right',
}: PostActionsMenuProps) {
  const { user, requireAuth, userRole } = useAuth()
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(initialSaved)
  const [saveLoading, setSaveLoading] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [unarchiveLoading, setUnarchiveLoading] = useState(false)
  const [hideLoading, setHideLoading] = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const isCreator = !!user && !!creatorUid && user.uid === creatorUid
  const isMod = userRole === 'moderator' || userRole === 'admin'

  useEffect(() => { setSaved(initialSaved) }, [initialSaved])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function toggleSave() {
    if (saveLoading) return
    setSaveLoading(true)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/discussions/${postId}/save`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(data.saved)
        onSavedChange?.(data.saved)
      }
    } finally {
      setSaveLoading(false)
      setOpen(false)
    }
  }

  async function handleArchive() {
    setArchiveLoading(true)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/discussions/${postId}/archive`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        setArchiveOpen(false)
        onArchived?.()
      }
    } finally {
      setArchiveLoading(false)
    }
  }

  async function handleUnarchive() {
    if (unarchiveLoading) return
    setUnarchiveLoading(true)
    setOpen(false)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/discussions/${postId}/archive`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) onUnarchived?.()
    } finally {
      setUnarchiveLoading(false)
    }
  }

  async function handleHide() {
    if (hideLoading) return
    setHideLoading(true)
    setOpen(false)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/discussions/${postId}/hide`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        toast.success('Đã ẩn bài viết')
        onHidden?.()
      }
    } finally {
      setHideLoading(false)
    }
  }

  async function handlePublish() {
    if (publishLoading) return
    setPublishLoading(true)
    setOpen(false)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/discussions/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isDraft: false }),
      })
      if (res.ok) onPublished?.()
    } finally {
      setPublishLoading(false)
    }
  }

  function handleSaveClick() {
    requireAuth(() => toggleSave())
  }

  function handleArchiveClick() {
    setOpen(false)
    setArchiveOpen(true)
  }

  return (
    <>
      <div ref={ref} className={cn('relative', className)}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v) }}
          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100"
          aria-label="Tuỳ chọn"
        >
          <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 11.75a1.75 1.75 0 11.001-3.501A1.75 1.75 0 0116 11.75zM11.75 10a1.75 1.75 0 10-3.501.001A1.75 1.75 0 0011.75 10zm-6 0a1.75 1.75 0 10-3.501.001A1.75 1.75 0 005.75 10z" />
          </svg>
        </button>

        {open && (
          <div className={cn(
            'absolute top-full z-50 mt-1 min-w-[188px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl',
            align === 'right' ? 'right-0' : 'left-0',
          )}>
            {/* Publish draft */}
            {isCreator && isDraft && (
              <button
                onClick={(e) => { e.stopPropagation(); handlePublish() }}
                disabled={publishLoading}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Send size={15} className="text-gray-400" />
                Đăng bài
              </button>
            )}

            {/* Save / Unsave */}
            {!isDraft && !isArchived && !isHiddenByMod && (
              <button
                onClick={(e) => { e.stopPropagation(); handleSaveClick() }}
                disabled={saveLoading}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Bookmark size={15} className={saved ? 'fill-primary text-primary' : 'text-gray-400'} />
                {saved ? 'Bỏ lưu' : 'Lưu'}
              </button>
            )}

            {/* Unarchive — creator restores their own archived post */}
            {isCreator && isArchived && (
              <button
                onClick={(e) => { e.stopPropagation(); handleUnarchive() }}
                disabled={unarchiveLoading}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-green-700 hover:bg-green-50 disabled:opacity-50"
              >
                <RotateCcw size={15} />
                Hiển thị lại
              </button>
            )}

            {/* Cannot restore — admin-hidden post (creator sees disabled button) */}
            {isCreator && isHiddenByMod && (
              <div className="group relative">
                <button
                  disabled
                  className="flex w-full cursor-not-allowed items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-400"
                >
                  <RotateCcw size={15} />
                  Hiển thị lại
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden w-56 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-center text-[11px] leading-snug text-white shadow-lg group-hover:block">
                  Bài viết có nội dung vi phạm không thể hiển thị lại
                </div>
              </div>
            )}

            {/* Archive — creator hides their own post */}
            {isCreator && !isDraft && !isArchived && !isHiddenByMod && (
              <button
                onClick={(e) => { e.stopPropagation(); handleArchiveClick() }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Archive size={15} />
                Lưu trữ
              </button>
            )}

            {/* Hide — mod/admin hides any post */}
            {isMod && !isHiddenByMod && !isDraft && (
              <button
                onClick={(e) => { e.stopPropagation(); handleHide() }}
                disabled={hideLoading}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <EyeOff size={15} />
                Ẩn bài viết
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={archiveOpen}
        title="Lưu trữ bài viết?"
        message="Bài viết sẽ được ẩn khỏi diễn đàn và chuyển vào mục «Đã ẩn» trong hồ sơ của bạn. Bạn vẫn có thể xem lại sau."
        confirmLabel="Lưu trữ"
        cancelLabel="Huỷ"
        destructive
        loading={archiveLoading}
        onConfirm={handleArchive}
        onCancel={() => setArchiveOpen(false)}
      />
    </>
  )
}
