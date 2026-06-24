'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, EyeOff, Eye, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { RichEditor } from '@/components/discussions/rich-editor'
import { DiscussionsSidebar } from '@/components/discussions/discussions-sidebar'
import { ImageCarousel } from '@/components/discussions/image-carousel'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/time-utils'
import type { DiscussionPost, PostMedia } from '@/lib/discussion-types'

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

const CATEGORIES = [
  { value: 'Chung',       label: 'p/chung',       bg: 'bg-sky-100',    fg: 'text-sky-700'    },
  { value: 'Kỹ thuật',   label: 'p/ky-thuat',    bg: 'bg-violet-100', fg: 'text-violet-700' },
  { value: 'Hỏi & Đáp',  label: 'p/hoi-dap',     bg: 'bg-amber-100',  fg: 'text-amber-700'  },
  { value: 'Giới thiệu', label: 'p/gioi-thieu',  bg: 'bg-green-100',  fg: 'text-green-700'  },
  { value: 'Sản phẩm',   label: 'p/san-pham',    bg: 'bg-rose-100',   fg: 'text-rose-700'   },
  { value: 'Kinh nghiệm',label: 'p/kinh-nghiem', bg: 'bg-teal-100',   fg: 'text-teal-700'   },
  { value: 'Hoạt động',  label: 'p/hoat-dong',   bg: 'bg-orange-100', fg: 'text-orange-700' },
]

type UploadedMedia = {
  id: string
  url: string
  type: 'image' | 'video'
  preview: string
  status: 'uploading' | 'done' | 'error'
}

const MAX_MEDIA = 5

export default function NewPostPage() {
  const router = useRouter()
  const { user, loading, requireAuth, userRole } = useAuth()

  const [title, setTitle]             = useState('')
  const [body, setBody]               = useState('')
  const [editorKey, setEditorKey]     = useState(0)
  const [editorDefault, setEditorDefault] = useState('')
  const [category, setCategory]       = useState(CATEGORIES[0])
  const [showCatMenu, setShowCatMenu] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [error, setError]             = useState('')
  const [media, setMedia]             = useState<UploadedMedia[]>([])

  // Draft panel
  const [showDrafts, setShowDrafts]       = useState(false)
  const [drafts, setDrafts]               = useState<DiscussionPost[]>([])
  const [draftsLoading, setDraftsLoading] = useState(false)
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null)
  const [deletingId, setDeletingId]         = useState<string | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const hasUploading = media.some((m) => m.status === 'uploading')
  const doneMedia    = media.filter((m) => m.status === 'done')

  useEffect(() => {
    if (!loading && !user) requireAuth(() => {})
  }, [loading, user, requireAuth])

  const loadDrafts = useCallback(async () => {
    setDraftsLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch('/api/profile/posts?tab=posts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json() as { posts: DiscussionPost[] }
      setDrafts(data.posts.filter((p) => p.status === 'draft'))
    } finally {
      setDraftsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) loadDrafts()
  }, [user, loadDrafts])

  function loadDraftIntoForm(draft: DiscussionPost) {
    setTitle(draft.title)
    setBody(draft.description ?? '')
    setEditorDefault(draft.description ?? '')
    setEditorKey((k) => k + 1)
    const cat = CATEGORIES.find((c) => c.value === draft.category) ?? CATEGORIES[0]
    setCategory(cat)
    setIsAnonymous(draft.isAnonymous ?? false)
    setMedia(
      (draft.media ?? []).map((m) => ({
        id: Math.random().toString(36).slice(2),
        url: m.url,
        type: m.type,
        preview: m.url,
        status: 'done' as const,
      }))
    )
    setEditingDraftId(draft.id)
    setShowDrafts(false)
  }

  async function deleteDraft(id: string) {
    setDeletingId(id)
    try {
      const token = await getIdToken()
      await fetch(`/api/discussions/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setDrafts((prev) => prev.filter((d) => d.id !== id))
      if (editingDraftId === id) {
        setEditingDraftId(null)
        setTitle('')
        setBody('')
        setEditorDefault('')
        setEditorKey((k) => k + 1)
        setMedia([])
        setCategory(CATEGORIES[0])
        setIsAnonymous(false)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const uploadFile = useCallback(async (file: File, mediaType: 'image' | 'video') => {
    const id = Math.random().toString(36).slice(2)
    const preview = URL.createObjectURL(file)
    setMedia((prev) => [...prev, { id, url: '', type: mediaType, preview, status: 'uploading' }])
    try {
      const token = await getIdToken()
      const form  = new FormData()
      form.append('file', file)
      form.append('folder', 'post')
      form.append('mediaType', mediaType)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      })
      if (!res.ok) throw new Error()
      const data = await res.json() as { url: string }
      setMedia((prev) => prev.map((m) => m.id === id ? { ...m, url: data.url, status: 'done' } : m))
    } catch {
      setMedia((prev) => prev.map((m) => m.id === id ? { ...m, status: 'error' } : m))
    }
  }, [])

  const handleImageSelect = useCallback(async (files: FileList | null) => {
    if (!files?.length) return
    const toUpload = Array.from(files).slice(0, MAX_MEDIA - media.length)
    for (const file of toUpload) await uploadFile(file, 'image')
    if (imageInputRef.current) imageInputRef.current.value = ''
  }, [media.length, uploadFile])

  const handleVideoSelect = useCallback(async (files: FileList | null) => {
    if (!files?.length || media.length >= MAX_MEDIA) return
    await uploadFile(files[0], 'video')
    if (videoInputRef.current) videoInputRef.current.value = ''
  }, [media.length, uploadFile])

  function removeMedia(id: string) {
    setMedia((prev) => {
      const item = prev.find((m) => m.id === id)
      if (item?.preview.startsWith('blob:')) URL.revokeObjectURL(item.preview)
      return prev.filter((m) => m.id !== id)
    })
  }

  async function submit(isDraft: boolean) {
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề.'); return }
    setError('')
    isDraft ? setSavingDraft(true) : setSubmitting(true)

    try {
      const token = await getIdToken()
      const payload = {
        title: title.trim(),
        description: body,
        category: category.value,
        tags: [],
        isAnonymous,
        media: doneMedia.map((m) => ({ url: m.url, type: m.type })) as PostMedia[],
        isDraft,
      }

      let resultId: string

      if (editingDraftId) {
        const res = await fetch(`/api/discussions/${editingDraftId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        resultId = editingDraftId
      } else {
        const res = await fetch('/api/discussions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        resultId = data.id
      }

      if (isDraft) {
        setEditingDraftId(resultId)
        await loadDrafts()
      } else {
        router.push(`/discussions/${resultId}`)
      }
    } catch (err) {
      setError((err as Error).message || 'Đăng bài thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
      setSavingDraft(false)
    }
  }

  const carouselItems: PostMedia[] = media.map((m) => ({ url: m.preview, type: m.type }))

  return (
    <div className="min-h-screen bg-white pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-12">

          {/* Sidebar */}
          <DiscussionsSidebar
            activeCategory={null}
            onCategoryChange={(cat) => router.push(cat ? `/discussions?category=${cat}` : '/discussions')}
            onNewThread={() => {}}
            userRole={userRole}
            activeView="posts"
            onViewChange={(view) => {
              if (view === 'moderation') router.push('/discussions?view=moderation')
              else if (view === 'user-management') router.push('/discussions?view=user-management')
              else router.push('/discussions')
            }}
          />

          {/* Form */}
          <div className="flex-1 min-w-0 pb-20">

            {/* Header row */}
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {editingDraftId ? 'Chỉnh sửa bản nháp' : 'Tạo bài viết'}
              </h1>

              {/* Drafts button */}
              <button
                type="button"
                onClick={() => setShowDrafts((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-4">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                Bản nháp
                {drafts.length > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-900 px-1.5 text-[11px] font-semibold text-white">
                    {drafts.length}
                  </span>
                )}
              </button>
            </div>

            {/* Drafts panel */}
            {showDrafts && (
              <div className="mb-6 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3.5">
                  <h2 className="text-[15px] font-semibold text-gray-900">
                    Bản nháp
                    <span className="ml-2 text-sm font-normal text-gray-400">{drafts.length}/20</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowDrafts(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                {draftsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-gray-400" />
                  </div>
                ) : drafts.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-gray-400">Chưa có bản nháp nào.</p>
                ) : (
                  <ul className="divide-y divide-[#f3f4f6]">
                    {drafts.map((draft) => (
                      <li
                        key={draft.id}
                        className={cn(
                          'flex items-center gap-3 px-5 py-3.5',
                          editingDraftId === draft.id && 'bg-gray-50',
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-800">
                            {draft.title || <span className="italic text-gray-400">Không có tiêu đề</span>}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {timeAgo(draft.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Chỉnh sửa"
                            onClick={() => loadDraftIntoForm(draft)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            title="Xoá"
                            onClick={() => deleteDraft(draft.id)}
                            disabled={deletingId === draft.id}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                          >
                            {deletingId === draft.id
                              ? <Loader2 size={13} className="animate-spin" />
                              : <Trash2 size={13} />
                            }
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex flex-col gap-5">

              {/* Category selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCatMenu((v) => !v)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors border',
                    category.bg, category.fg, 'border-transparent hover:opacity-80',
                  )}
                >
                  <span>{category.label}</span>
                  <X
                    size={13}
                    className="opacity-60"
                    onClick={(e) => { e.stopPropagation(); setCategory(CATEGORIES[0]) }}
                  />
                </button>

                {showCatMenu && (
                  <div className="absolute left-0 top-full z-20 mt-1.5 w-52 rounded-xl border border-[#e5e7eb] bg-white shadow-lg py-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => { setCategory(cat); setShowCatMenu(false) }}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors',
                          cat.value === category.value && 'font-semibold',
                        )}
                      >
                        <span className={cn('inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold', cat.bg, cat.fg)}>
                          {cat.value[0]}
                        </span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <input
                type="text"
                placeholder="Tiêu đề *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full rounded-xl border border-[#e5e7eb] px-5 py-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />

              {/* Media carousel */}
              {media.length > 0 && (
                <div>
                  <ImageCarousel items={carouselItems} maxHeight={360} />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {media.map((m, i) => (
                      <div key={m.id} className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700">
                        {m.type === 'video' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-3.5 text-gray-500">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m15 10 4.553-2.276A1 1 0 0 1 21 8.723v6.554a1 1 0 0 1-1.447.894L15 14M3 8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-3.5 text-gray-500">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 15-5-5L5 21M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm6.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                          </svg>
                        )}
                        <span>{m.type === 'video' ? 'Video' : 'Ảnh'} {i + 1}</span>
                        {m.status === 'uploading' && <Loader2 size={11} className="animate-spin text-gray-400" />}
                        {m.status === 'error' && <span className="text-red-500">Lỗi</span>}
                        <button
                          type="button"
                          onClick={() => removeMedia(m.id)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-gray-200 transition-colors"
                        >
                          <X size={10} className="text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rich text editor — toolbar at bottom with media upload buttons */}
              <RichEditor
                key={editorKey}
                defaultValue={editorDefault}
                onChange={setBody}
                placeholder="Nội dung bài viết (tuỳ chọn)..."
                toolbarPosition="bottom"
                onImageClick={media.length < MAX_MEDIA ? () => imageInputRef.current?.click() : undefined}
                onVideoClick={media.length < MAX_MEDIA ? () => videoInputRef.current?.click() : undefined}
              />

              {/* Error */}
              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsAnonymous((v) => !v)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors',
                    isAnonymous
                      ? 'border-gray-400 bg-gray-100 text-gray-700'
                      : 'border-[#e5e7eb] text-gray-500 hover:bg-gray-50',
                  )}
                >
                  {isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                  {isAnonymous ? 'Đang ẩn danh' : 'Đăng ẩn danh'}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-full px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Huỷ
                  </button>
                  <button
                    type="button"
                    onClick={() => submit(true)}
                    disabled={savingDraft || submitting || hasUploading || !title.trim()}
                    className="flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {savingDraft && <Loader2 size={14} className="animate-spin" />}
                    Lưu nháp
                  </button>
                  <button
                    type="button"
                    onClick={() => submit(false)}
                    disabled={submitting || savingDraft || hasUploading || !title.trim()}
                    className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {(submitting || hasUploading) && <Loader2 size={14} className="animate-spin" />}
                    {hasUploading ? 'Đang tải...' : 'Đăng bài'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageSelect(e.target.files)}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleVideoSelect(e.target.files)}
      />
    </div>
  )
}
