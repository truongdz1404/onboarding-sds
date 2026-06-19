'use client'

import { useState, useEffect } from 'react'
import { X, Send, Loader2, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/lib/auth-context'

const CATEGORIES = ['Chung', 'Văn hóa', 'Sản phẩm', 'Tip & Trick', 'Hỏi đáp', 'Thông báo']

interface CreatePostModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

export function CreatePostModal({ open, onClose, onCreated }: CreatePostModalProps) {
  const { user, requireAuth } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Chung')
  const [tags, setTags] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function handleOpenAttempt() {
    requireAuth(() => {/* modal already open */})
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !title.trim()) return
    setLoading(true)
    setError('')
    try {
      const token = await getIdToken()
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          isAnonymous: anonymous,
        }),
      })
      if (!res.ok) throw new Error()
      setTitle('')
      setDescription('')
      setTags('')
      setAnonymous(false)
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
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-lg -translate-y-1/2 rounded-2xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: '-46%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.96, y: '-46%' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-bold text-text-dark">Đăng bài thảo luận</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Logged-in user info */}
              {user && (
                <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {user.displayName?.[0] ?? 'U'}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-dark">
                      {anonymous ? 'Ẩn danh' : (user.displayName ?? user.email)}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>

                  {/* Anonymous toggle */}
                  <button
                    type="button"
                    onClick={() => setAnonymous((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      anonymous
                        ? 'bg-foreground text-white'
                        : 'border border-border text-muted-foreground hover:border-foreground/40'
                    }`}
                  >
                    <EyeOff size={12} />
                    Ẩn danh
                  </button>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-text-dark">
                  Tiêu đề <span className="text-primary">*</span>
                </label>
                <input
                  className="input-flat w-full"
                  placeholder="Bạn muốn chia sẻ điều gì?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">{title.length}/120</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-text-dark">Mô tả ngắn</label>
                <textarea
                  className="input-flat w-full resize-none"
                  rows={3}
                  placeholder="Thêm chi tiết để mọi người hiểu rõ hơn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-text-dark">Chủ đề</label>
                  <select
                    className="input-flat w-full"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-text-dark">
                    Tags <span className="font-normal text-muted-foreground">(cách bởi dấu phẩy)</span>
                  </label>
                  <input
                    className="input-flat w-full"
                    placeholder="onboarding, tip"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              {anonymous && (
                <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
                  <EyeOff size={13} />
                  Bài viết sẽ hiển thị là "Ẩn danh". Quản trị viên vẫn biết bạn là ai.
                </p>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading || !title.trim() || !user}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? 'Đang đăng...' : 'Đăng bài'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
