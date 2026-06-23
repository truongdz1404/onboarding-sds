'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, EyeOff, Eye, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { RichEditor } from '@/components/discussions/rich-editor'
import { DiscussionsSidebar } from '@/components/discussions/discussions-sidebar'
import { cn } from '@/lib/utils'

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

const CATEGORIES = [
  { value: 'Chung', label: 'p/chung', bg: 'bg-sky-100', fg: 'text-sky-700' },
  { value: 'Kỹ thuật', label: 'p/ky-thuat', bg: 'bg-violet-100', fg: 'text-violet-700' },
  { value: 'Hỏi & Đáp', label: 'p/hoi-dap', bg: 'bg-amber-100', fg: 'text-amber-700' },
  { value: 'Giới thiệu', label: 'p/gioi-thieu', bg: 'bg-green-100', fg: 'text-green-700' },
  { value: 'Sản phẩm', label: 'p/san-pham', bg: 'bg-rose-100', fg: 'text-rose-700' },
  { value: 'Kinh nghiệm', label: 'p/kinh-nghiem', bg: 'bg-teal-100', fg: 'text-teal-700' },
  { value: 'Hoạt động', label: 'p/hoat-dong', bg: 'bg-orange-100', fg: 'text-orange-700' },
]

export default function NewPostPage() {
  const router = useRouter()
  const { user, loading, requireAuth } = useAuth()

  const [title, setTitle]           = useState('')
  const [body, setBody]             = useState('')
  const [category, setCategory]     = useState(CATEGORIES[0])
  const [showCatMenu, setShowCatMenu] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting]  = useState(false)
  const [error, setError]           = useState('')

  /* Redirect to login if not authed */
  useEffect(() => {
    if (!loading && !user) {
      requireAuth(() => {})
    }
  }, [loading, user, requireAuth])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề.'); return }
    setError('')
    setSubmitting(true)
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
          description: body,
          category: category.value,
          tags: [],
          isAnonymous,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/discussions/${data.id}`)
    } catch (err) {
      setError((err as Error).message || 'Đăng bài thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const activeCat = CATEGORIES.find(() => false) // always null for this page

  return (
    <div className="min-h-screen bg-white pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-12">

          {/* Sidebar */}
          <DiscussionsSidebar
            activeCategory={null}
            onCategoryChange={(cat) => router.push(cat ? `/discussions?category=${cat}` : '/discussions')}
            onNewThread={() => {}}
          />

          {/* Form */}
          <div className="flex-1 min-w-0 pb-20">
            <h1 className="mb-8 text-2xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
              Tạo bài viết
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

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

              {/* Category description */}
              <p className="text-[13px] text-gray-500 -mt-3">
                Chia sẻ thảo luận, hỏi đáp, kinh nghiệm cùng đồng nghiệp SoftDreams.
              </p>

              {/* Title */}
              <input
                type="text"
                placeholder="Tiêu đề *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full rounded-xl border border-[#e5e7eb] px-5 py-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />

              {/* Rich text editor */}
              <RichEditor onChange={setBody} placeholder="Nội dung bài viết (tuỳ chọn)..." />

              {/* Error */}
              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Footer: anonymous + submit */}
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
                    type="submit"
                    disabled={submitting || !title.trim()}
                    className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
