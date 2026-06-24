'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X, Loader2, Globe, Bold, Italic, List, ListOrdered,
  Link2, Code2, Quote, AtSign, AlignJustify, ImagePlus, Plus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/lib/auth-context'

const CATEGORIES: { id: string; label: string; description: string }[] = [
  { id: 'Chung', label: 'Chung', description: 'Chia sẻ và thảo luận về công việc, công cụ, tip & trick hoặc bất kỳ chủ đề nào.' },
  { id: 'Văn hóa', label: 'Văn hóa', description: 'Chủ đề về văn hóa công ty, team building và môi trường làm việc.' },
  { id: 'Sản phẩm', label: 'Sản phẩm', description: 'Thảo luận về sản phẩm SoftDreams, tính năng mới và cải tiến.' },
  { id: 'Tip & Trick', label: 'Tip & Trick', description: 'Chia sẻ mẹo, công cụ và thủ thuật hữu ích trong công việc.' },
  { id: 'Hỏi đáp', label: 'Hỏi đáp', description: 'Đặt câu hỏi và nhận câu trả lời từ đồng nghiệp.' },
  { id: 'Thông báo', label: 'Thông báo', description: 'Thông báo quan trọng từ ban quản lý và các phòng ban.' },
]

interface CreatePostModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

const TOOLBAR = [
  { icon: Bold,         cmd: 'bold',               title: 'Bold' },
  { icon: Italic,       cmd: 'italic',             title: 'Italic' },
  { icon: ListOrdered,  cmd: 'insertOrderedList',  title: 'Ordered list' },
  { icon: List,         cmd: 'insertUnorderedList', title: 'Bullet list' },
  { icon: Link2,        cmd: 'link',               title: 'Link' },
  { icon: Code2,        cmd: 'code',               title: 'Code' },
  { icon: Quote,        cmd: 'quote',              title: 'Quote' },
  { icon: AtSign,       cmd: 'mention',            title: 'Mention' },
  { icon: AlignJustify, cmd: 'more',               title: 'More' },
]

type UploadedImage = {
  id: string
  url: string
  preview: string
  status: 'uploading' | 'done' | 'error'
}

const MAX_IMAGES = 5

export function CreatePostModal({ open, onClose, onCreated }: CreatePostModalProps) {
  const { user } = useAuth()
  const [title, setTitle]             = useState('')
  const [category, setCategory]       = useState('Chung')
  const [showCatMenu, setShowCatMenu] = useState(false)
  const [titleTouched, setTitleTouched] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [images, setImages]           = useState<UploadedImage[]>([])
  const bodyRef      = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentCat = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0]
  const titleError  = titleTouched && !title.trim()
  const doneImages  = images.filter((i) => i.status === 'done')
  const hasUploading = images.some((i) => i.status === 'uploading')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setTitle('')
      setTitleTouched(false)
      setError('')
      setShowCatMenu(false)
      setImages([])
      if (bodyRef.current) bodyRef.current.innerHTML = ''
    }
  }, [open])

  function applyFormat(cmd: string) {
    if (cmd === 'code') {
      document.execCommand('formatBlock', false, 'pre')
    } else if (cmd === 'quote') {
      document.execCommand('formatBlock', false, 'blockquote')
    } else if (cmd === 'link') {
      const url = prompt('Nhập URL:')
      if (url) document.execCommand('createLink', false, url)
    } else if (['bold', 'italic', 'insertOrderedList', 'insertUnorderedList'].includes(cmd)) {
      document.execCommand(cmd, false)
    }
    bodyRef.current?.focus()
  }

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files?.length) return
    const remaining = MAX_IMAGES - images.length
    const toUpload = Array.from(files).slice(0, remaining)

    const newItems: UploadedImage[] = toUpload.map((file) => ({
      id: Math.random().toString(36).slice(2),
      url: '',
      preview: URL.createObjectURL(file),
      status: 'uploading',
    }))
    setImages((prev) => [...prev, ...newItems])

    for (let i = 0; i < toUpload.length; i++) {
      const file  = toUpload[i]
      const item  = newItems[i]
      try {
        const token = await getIdToken()
        const form  = new FormData()
        form.append('file', file)
        form.append('folder', 'post')
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        })
        if (!res.ok) throw new Error()
        const data = await res.json() as { url: string }
        setImages((prev) =>
          prev.map((img) => img.id === item.id ? { ...img, url: data.url, status: 'done' } : img)
        )
      } catch {
        setImages((prev) =>
          prev.map((img) => img.id === item.id ? { ...img, status: 'error' } : img)
        )
      }
    }
    // reset so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [images.length])

  function removeImage(id: string) {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img?.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview)
      return prev.filter((i) => i.id !== id)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTitleTouched(true)
    if (!title.trim() || !user) return
    setLoading(true)
    setError('')
    try {
      const token = await getIdToken()
      const bodyHtml = bodyRef.current?.innerHTML?.trim() ?? ''
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          description: bodyHtml,
          category,
          tags: [],
          isAnonymous: false,
          images: doneImages.map((i) => i.url),
        }),
      })
      if (!res.ok) throw new Error()
      onCreated()
      onClose()
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-xl -translate-y-1/2 rounded-2xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.97, y: '-46%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.97, y: '-46%' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-5">
              <h2 className="text-[20px] font-bold text-[#1f2937]">Start new thread</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#9ca3af] transition-colors hover:bg-[#f3f4f6] hover:text-[#374151]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-6 pb-6 space-y-4">
              {/* Category chip */}
              <div className="relative">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCatMenu((v) => !v)}
                    className="flex items-center gap-1.5 rounded-full border border-[#d1d5db] bg-white px-3 py-1.5 text-[13px] font-medium text-[#374151] transition-colors hover:border-[#9ca3af]"
                  >
                    <Globe size={13} className="text-[#6b7280]" />
                    {currentCat.label}
                    <X
                      size={12}
                      className="text-[#9ca3af] hover:text-[#374151]"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCategory('Chung')
                        setShowCatMenu(false)
                      }}
                    />
                  </button>
                </div>

                {showCatMenu && (
                  <div className="absolute left-0 top-10 z-10 w-64 rounded-xl border border-[#e5e7eb] bg-white shadow-lg">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { setCategory(cat.id); setShowCatMenu(false) }}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-[#f9fafb] ${
                          category === cat.id ? 'font-semibold text-primary' : 'text-[#374151]'
                        }`}
                      >
                        <Globe size={14} className="flex-shrink-0 text-[#9ca3af]" />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category description */}
              <p className="text-[13px] text-[#6b7280]">{currentCat.description}</p>

              {/* Title */}
              <div>
                <input
                  type="text"
                  placeholder="Title*"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setTitleTouched(true) }}
                  onBlur={() => setTitleTouched(true)}
                  maxLength={120}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-[#1f2937] outline-none transition-colors placeholder:text-[#9ca3af] focus:ring-2 ${
                    titleError
                      ? 'border-red-400 bg-red-50/50 focus:ring-red-100'
                      : 'border-[#e5e7eb] focus:border-primary focus:ring-primary/10'
                  }`}
                />
                {titleError && (
                  <p className="mt-1 text-xs font-medium text-red-500">Required</p>
                )}
              </div>

              {/* Rich text body */}
              <div className="overflow-hidden rounded-xl border border-[#e5e7eb] focus-within:border-[#d1d5db]">
                {/* Toolbar */}
                <div className="flex items-center gap-0.5 border-b border-[#f0f0f0] px-2 py-1.5">
                  {TOOLBAR.map(({ icon: Icon, cmd, title: t }) => (
                    <button
                      key={cmd}
                      type="button"
                      title={t}
                      onMouseDown={(e) => { e.preventDefault(); applyFormat(cmd) }}
                      className="flex h-7 w-7 items-center justify-center rounded text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#374151]"
                    >
                      <Icon size={14} strokeWidth={1.8} />
                    </button>
                  ))}

                  {/* Divider */}
                  <div className="mx-1 h-4 w-px bg-[#e5e7eb]" />

                  {/* Image upload button */}
                  <button
                    type="button"
                    title="Thêm ảnh"
                    disabled={images.length >= MAX_IMAGES}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-7 w-7 items-center justify-center rounded text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#374151] disabled:opacity-40"
                  >
                    <ImagePlus size={14} strokeWidth={1.8} />
                  </button>
                </div>

                {/* Editable area */}
                <div
                  ref={bodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Body"
                  className="min-h-[120px] px-4 py-3 text-sm text-[#374151] outline-none [&:empty::before]:text-[#9ca3af] [&:empty::before]:content-[attr(data-placeholder)]"
                />
              </div>

              {/* Image previews */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-3">
                  {images.map((img) => (
                    <div key={img.id} className="relative h-20 w-20 flex-shrink-0">
                      <div className="h-full w-full overflow-hidden rounded-lg bg-gray-200">
                        <img
                          src={img.preview}
                          alt=""
                          className="h-full w-full object-cover"
                          style={{ opacity: img.status === 'uploading' ? 0.4 : 1 }}
                        />
                        {img.status === 'uploading' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 size={18} className="animate-spin text-gray-500" />
                          </div>
                        )}
                        {img.status === 'error' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-50/80 text-xs text-red-500 font-medium">
                            Lỗi
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white shadow-sm hover:bg-gray-900"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* Add more button */}
                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-primary hover:text-primary"
                    >
                      <Plus size={22} />
                    </button>
                  )}
                </div>
              )}

              {/* Add photo CTA (shown when no images) */}
              {images.length === 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d1d5db] py-3 text-[13px] text-[#6b7280] transition-colors hover:border-[#9ca3af] hover:text-[#374151]"
                >
                  <ImagePlus size={15} />
                  Thêm ảnh
                </button>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Footer */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading || hasUploading || !title.trim() || !user}
                  className="rounded-full border border-[#d1d5db] bg-white px-5 py-2 text-sm font-semibold text-[#374151] transition-all hover:border-[#9ca3af] hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Đang đăng...
                    </span>
                  ) : hasUploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Đang tải ảnh...
                    </span>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
