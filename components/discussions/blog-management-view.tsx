'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, Upload, X, Eye, ChevronUp, ChevronDown, ImagePlus, List, FileText } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { CATEGORIES, POSTS } from '@/lib/blog-data'
import type { BlogPostDetail, BlogSection, Post } from '@/lib/blog-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

// ── helpers ───────────────────────────────────────────────────────────────────

const VI_MAP: Record<string, string> = {
  à:'a',á:'a',ả:'a',ã:'a',ạ:'a',ă:'a',ắ:'a',ặ:'a',ằ:'a',ẵ:'a',ẳ:'a',
  â:'a',ấ:'a',ầ:'a',ẩ:'a',ẫ:'a',ậ:'a',è:'e',é:'e',ẻ:'e',ẽ:'e',ẹ:'e',
  ê:'e',ế:'e',ề:'e',ể:'e',ễ:'e',ệ:'e',ì:'i',í:'i',ỉ:'i',ĩ:'i',ị:'i',
  ò:'o',ó:'o',ỏ:'o',õ:'o',ọ:'o',ô:'o',ố:'o',ồ:'o',ổ:'o',ỗ:'o',ộ:'o',
  ơ:'o',ớ:'o',ờ:'o',ở:'o',ỡ:'o',ợ:'o',ù:'u',ú:'u',ủ:'u',ũ:'u',ụ:'u',
  ư:'u',ứ:'u',ừ:'u',ử:'u',ữ:'u',ự:'u',ỳ:'y',ý:'y',ỷ:'y',ỹ:'y',ỵ:'y',đ:'d',
}

function slugify(text: string): string {
  return text.toLowerCase().split('').map(c => VI_MAP[c] ?? c).join('')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

const CATEGORY_STYLES: Record<string, { accent: string; badge: string }> = {
  'Chấm công':        { accent: 'bg-primary/10', badge: 'bg-primary text-white' },
  'Bảo hiểm xã hội': { accent: 'bg-blue-50',    badge: 'bg-blue-600 text-white' },
  'Lương & Thuế':     { accent: 'bg-amber-50',   badge: 'bg-amber-600 text-white' },
  'Nội quy':          { accent: 'bg-primary/10', badge: 'bg-primary text-white' },
  'Tips làm việc':    { accent: 'bg-green-50',   badge: 'bg-green-600 text-white' },
  'Sản phẩm':         { accent: 'bg-purple-50',  badge: 'bg-purple-600 text-white' },
}

const BLOG_CATEGORIES = CATEGORIES.filter(c => c !== 'Tất cả')
const STATIC_SLUGS: { slug: string; title: string }[] = POSTS.map(p => ({ slug: p.slug, title: p.title }))

async function getToken(): Promise<string | null> {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

// ── ImageUpload ───────────────────────────────────────────────────────────────

function ImageUpload({ value, onChange, label }: {
  value?: string; onChange: (url: string) => void; label: string
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const token = await getToken()
      const fd = new FormData()
      fd.append('file', file); fd.append('folder', 'post'); fd.append('mediaType', 'image')
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      const data = await res.json()
      if (data.url) onChange(data.url)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="relative flex justify-center rounded-lg border border-input bg-muted/30 p-1">
          <img src={value} alt="" className="max-h-52 max-w-full rounded-md object-contain" />
          <Button
            type="button" variant="destructive" size="icon-sm"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 opacity-90"
          >
            <X />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input py-8 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? 'Đang tải lên…' : 'Chọn ảnh'}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── SectionEditor ─────────────────────────────────────────────────────────────

function SectionEditor({ section, index, total, onChange, onRemove, onMove }: {
  section: BlogSection & { image?: string }
  index: number; total: number
  onChange: (s: BlogSection & { image?: string }) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const hasBullets = (section.bullets ?? []).length > 0
  const hasImage = !!section.image

  function updateBody(pIdx: number, val: string) {
    const body = [...section.body]; body[pIdx] = val; onChange({ ...section, body })
  }
  function removeBody(pIdx: number) {
    onChange({ ...section, body: section.body.filter((_, i) => i !== pIdx) })
  }
  function updateBullet(bIdx: number, val: string) {
    const bullets = [...(section.bullets ?? [])]; bullets[bIdx] = val; onChange({ ...section, bullets })
  }
  function removeBullet(bIdx: number) {
    onChange({ ...section, bullets: (section.bullets ?? []).filter((_, i) => i !== bIdx) })
  }

  return (
    <Card className="gap-0 overflow-hidden">
      {/* Section header */}
      <CardHeader className="border-b bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {index + 1}
          </span>
          <Input
            value={section.heading}
            onChange={e => onChange({ ...section, heading: e.target.value })}
            placeholder="Tiêu đề phần…"
            className="h-7 border-0 bg-transparent px-0 text-sm font-semibold shadow-none focus-visible:ring-0 placeholder:font-normal"
          />
          <div className="flex shrink-0 items-center">
            <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => onMove(-1)}>
              <ChevronUp />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" disabled={index === total - 1} onClick={() => onMove(1)}>
              <ChevronDown />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove} className="text-destructive hover:text-destructive">
              <Trash2 />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {/* Body paragraphs */}
        <div className="rounded-lg bg-muted/30 p-3 space-y-2">
          {section.body.map((para, pIdx) => (
            <div key={pIdx} className="flex items-start gap-2">
              <span className="mt-2 flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-bold text-muted-foreground ring-1 ring-border">
                {pIdx + 1}
              </span>
              <Textarea
                value={para}
                onChange={e => updateBody(pIdx, e.target.value)}
                placeholder={`Đoạn văn ${pIdx + 1}…`}
                rows={2}
                className="resize-none text-sm"
              />
              {section.body.length > 1 && (
                <Button type="button" variant="ghost" size="icon-sm" className="mt-1 shrink-0" onClick={() => removeBody(pIdx)}>
                  <X />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button" variant="ghost" size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onChange({ ...section, body: [...section.body, ''] })}
          >
            <Plus className="size-3" /> Thêm đoạn
          </Button>
        </div>

        {/* Bullets — collapsed when empty */}
        {hasBullets ? (
          <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Gạch đầu dòng</span>
              <Button
                type="button" variant="ghost" size="icon-xs"
                className="text-muted-foreground"
                onClick={() => onChange({ ...section, bullets: [] })}
                title="Xoá hết bullets"
              >
                <X />
              </Button>
            </div>
            {(section.bullets ?? []).map((b, bIdx) => (
              <div key={bIdx} className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
                <Input value={b} onChange={e => updateBullet(bIdx, e.target.value)} placeholder={`Điểm ${bIdx + 1}…`} className="h-7 text-sm" />
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeBullet(bIdx)}><X /></Button>
              </div>
            ))}
            <Button
              type="button" variant="ghost" size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onChange({ ...section, bullets: [...(section.bullets ?? []), ''] })}
            >
              <Plus className="size-3" /> Thêm điểm
            </Button>
          </div>
        ) : (
          <Button
            type="button" variant="ghost" size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onChange({ ...section, bullets: [''] })}
          >
            <List className="size-3.5" /> Thêm gạch đầu dòng
          </Button>
        )}

        {/* Image — collapsed when empty */}
        {hasImage ? (
          <div className="relative flex justify-center rounded-lg border border-input bg-muted/30 p-1">
            <img src={section.image} alt="" className="max-h-40 max-w-full rounded-md object-contain" />
            <Button
              type="button" variant="destructive" size="icon-sm"
              className="absolute right-2 top-2 opacity-90"
              onClick={() => onChange({ ...section, image: undefined })}
            >
              <X />
            </Button>
          </div>
        ) : (
          <Button
            type="button" variant="ghost" size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImagePlus className="size-3.5" /> Thêm ảnh minh họa
          </Button>
        )}
        {/* Hidden input — triggered by the button above */}
        <input
          ref={imageInputRef}
          type="file" accept="image/*" className="hidden"
          onChange={async e => {
            const file = e.target.files?.[0]; if (!file) return
            const { auth } = await import('@/lib/firebase-client')
            const token = await auth.currentUser?.getIdToken()
            const fd = new FormData()
            fd.append('file', file); fd.append('folder', 'post'); fd.append('mediaType', 'image')
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: fd,
            })
            const data = await res.json()
            if (data.url) onChange({ ...section, image: data.url })
            if (imageInputRef.current) imageInputRef.current.value = ''
          }}
        />
      </CardContent>
    </Card>
  )
}

// ── empty form ────────────────────────────────────────────────────────────────

type FormState = Omit<BlogPostDetail, 'accent' | 'badge' | 'views'>

function emptyForm(): FormState {
  return {
    slug: '', title: '', excerpt: '', category: BLOG_CATEGORIES[0], readTime: '',
    author: 'Phòng Nhân sự', authorRole: 'People Operations',
    publishedAt: '', updatedAt: '', heroLabel: '', takeaway: '',
    tableOfContents: [], sections: [], checklist: [], relatedSlugs: [], coverImage: '',
  }
}

// ── BlogManagementView ────────────────────────────────────────────────────────

export function BlogManagementView() {
  const { user } = useAuth()
  const [mode, setMode] = useState<'list' | 'form'>('list')
  const [editingSlug, setEditingSlug] = useState<string | null>(null)

  // list state
  const [posts, setPosts] = useState<BlogPostDetail[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)

  // form state
  const [form, setForm] = useState<FormState>(emptyForm())
  const [slugManual, setSlugManual] = useState(false)
  const [sections, setSections] = useState<(BlogSection & { image?: string })[]>([{ heading: '', body: [''] }])
  const [checklist, setChecklist] = useState<string[]>([''])
  const [relatedSlugs, setRelatedSlugs] = useState<string[]>([])
  const [coverImage, setCoverImage] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [relatedPool, setRelatedPool] = useState(STATIC_SLUGS)

  const fetchPosts = useCallback(async () => {
    setLoadingList(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/blog', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      const fbPosts: BlogPostDetail[] = data.posts ?? []
      setPosts(fbPosts)
      setRelatedPool([
        ...STATIC_SLUGS,
        ...fbPosts
          .map((p: Post) => ({ slug: p.slug, title: p.title }))
          .filter(p => !STATIC_SLUGS.find(s => s.slug === p.slug)),
      ])
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // auto-slug from title (only when creating)
  useEffect(() => {
    if (!slugManual && !editingSlug) {
      setForm(f => ({ ...f, slug: slugify(f.title) }))
    }
  }, [form.title, slugManual, editingSlug])

  function openCreate() {
    setForm(emptyForm())
    setSections([{ heading: '', body: [''] }])
    setChecklist([''])
    setRelatedSlugs([])
    setCoverImage('')
    setSlugManual(false)
    setEditingSlug(null)
    setFormError('')
    setMode('form')
  }

  function openEdit(post: BlogPostDetail) {
    setForm({ ...post })
    setSections(post.sections.map(s => ({ ...s })))
    setChecklist(post.checklist.length ? [...post.checklist] : [''])
    setRelatedSlugs([...(post.relatedSlugs ?? [])])
    setCoverImage(post.coverImage ?? '')
    setSlugManual(true)
    setEditingSlug(post.slug)
    setFormError('')
    setMode('form')
  }

  async function handleDelete(slug: string) {
    if (!confirm('Xoá bài viết này?')) return
    setDeletingSlug(slug)
    try {
      const token = await getToken()
      await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      await fetchPosts()
    } finally {
      setDeletingSlug(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (!form.title.trim()) return setFormError('Vui lòng nhập tiêu đề.')
    if (!form.slug.trim()) return setFormError('Slug không được để trống.')
    if (!form.excerpt.trim()) return setFormError('Vui lòng nhập mô tả ngắn.')
    if (sections.length === 0) return setFormError('Cần ít nhất 1 phần nội dung.')
    if (sections.some(s => !s.heading.trim())) return setFormError('Mỗi phần cần có tiêu đề.')

    setSaving(true)
    try {
      const token = await getToken()
      const style = CATEGORY_STYLES[form.category] ?? { accent: 'bg-gray-50', badge: 'bg-gray-600 text-white' }

      const payload = {
        ...form,
        slug: form.slug.trim(),
        accent: style.accent,
        badge: style.badge,
        sections: sections.map(s => ({
          heading: s.heading,
          body: s.body.filter(p => p.trim()),
          ...(s.bullets?.filter(b => b.trim()).length ? { bullets: s.bullets.filter(b => b.trim()) } : {}),
          ...(s.image ? { image: s.image } : {}),
        })),
        tableOfContents: sections.map(s => s.heading).filter(Boolean),
        checklist: checklist.filter(c => c.trim()),
        relatedSlugs,
        coverImage: coverImage || null,
      }

      const isEdit = !!editingSlug
      const res = await fetch(isEdit ? `/api/blog/${editingSlug}` : '/api/blog', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error ?? 'Lưu thất bại.')
        return
      }

      await fetchPosts()
      setMode('list')
    } finally {
      setSaving(false)
    }
  }

  // ── List view ─────────────────────────────────────────────────────────────

  if (mode === 'list') {
    return (
      <div className="flex-1 min-w-0">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quản lý Blog</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Bài viết được lưu trên Firebase</p>
          </div>
          <Button onClick={openCreate} className="gap-2 rounded-full">
            <Plus className="size-4" /> Tạo bài viết mới
          </Button>
        </div>

        {loadingList ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="mb-3 size-10 text-muted-foreground/40">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
              </svg>
              <p className="font-semibold text-muted-foreground">Chưa có bài viết nào</p>
              <Button variant="link" onClick={openCreate} className="mt-2 gap-1.5">
                <Plus className="size-3.5" /> Tạo bài viết đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <Card key={post.slug}>
                <CardContent className="flex items-center gap-4 p-3">
                  {/* Thumbnail — always shown */}
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FileText className="size-5 text-muted-foreground/30" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.publishedAt}</span>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold">{post.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{post.excerpt}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-0.5">
                    <a
                      href={`/blog/${post.slug}`} target="_blank"
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Xem bài"
                    >
                      <Eye className="size-4" />
                    </a>
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(post)} title="Chỉnh sửa">
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost" size="icon-sm"
                      onClick={() => handleDelete(post.slug)}
                      disabled={deletingSlug === post.slug}
                      className="text-destructive hover:text-destructive"
                      title="Xoá"
                    >
                      {deletingSlug === post.slug ? <Loader2 className="animate-spin" /> : <Trash2 />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Form view ─────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={() => setMode('list')}>
          <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {editingSlug ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h2>
          <p className="text-sm text-muted-foreground">Điền đầy đủ thông tin bên dưới</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 pb-20">

        {/* Ảnh bìa */}
        <Card>
          <CardHeader><CardTitle>Ảnh bìa</CardTitle></CardHeader>
          <CardContent>
            <ImageUpload value={coverImage} onChange={setCoverImage} label="Upload ảnh bìa (tuỳ chọn)" />
          </CardContent>
        </Card>

        {/* Thông tin cơ bản */}
        <Card>
          <CardHeader><CardTitle>Thông tin cơ bản</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="VD: Hướng dẫn chấm công bằng EasyHRM từ A–Z"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={e => { setSlugManual(true); setForm(f => ({ ...f, slug: e.target.value })) }}
                  placeholder="huong-dan-cham-cong"
                  className="font-mono text-xs"
                />
                {!editingSlug && (
                  <p className="text-xs text-muted-foreground">Tự tạo từ tiêu đề. Chỉnh nếu cần.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Danh mục *</Label>
                <Select
                  value={form.category}
                  onValueChange={(val: string | null) => val && setForm(f => ({ ...f, category: val }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Mô tả ngắn *</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Tóm tắt bài viết hiển thị ở trang danh sách…"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="heroLabel">Nhãn hero</Label>
                <Input
                  id="heroLabel"
                  value={form.heroLabel}
                  onChange={e => setForm(f => ({ ...f, heroLabel: e.target.value }))}
                  placeholder="VD: Cẩm nang ngày đầu"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="readTime">Thời gian đọc</Label>
                <Input
                  id="readTime"
                  value={form.readTime}
                  onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                  placeholder="VD: 5 phút"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="author">Tác giả</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="authorRole">Chức danh tác giả</Label>
                <Input
                  id="authorRole"
                  value={form.authorRole}
                  onChange={e => setForm(f => ({ ...f, authorRole: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nội dung */}
        <Card>
          <CardHeader><CardTitle>Nội dung bài viết</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="takeaway">Điểm cần nhớ (Takeaway) *</Label>
              <Textarea
                id="takeaway"
                value={form.takeaway}
                onChange={e => setForm(f => ({ ...f, takeaway: e.target.value }))}
                placeholder="Điều quan trọng nhất người đọc cần ghi nhớ…"
                rows={3}
                className="resize-none"
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Các phần nội dung *</Label>
              {sections.map((section, idx) => (
                <SectionEditor
                  key={idx}
                  section={section}
                  index={idx}
                  total={sections.length}
                  onChange={updated => setSections(prev => prev.map((s, i) => i === idx ? updated : s))}
                  onRemove={() => setSections(prev => prev.filter((_, i) => i !== idx))}
                  onMove={dir => setSections(prev => {
                    const next = [...prev]; const swap = idx + dir
                    ;[next[idx], next[swap]] = [next[swap], next[idx]]
                    return next
                  })}
                />
              ))}
              <Button
                type="button" variant="outline"
                className="w-full gap-2 border-dashed"
                onClick={() => setSections(prev => [...prev, { heading: '', body: [''] }])}
              >
                <Plus className="size-4" /> Thêm phần mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader><CardTitle>Checklist nhanh</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={item}
                  onChange={e => setChecklist(prev => prev.map((c, i) => i === idx ? e.target.value : c))}
                  placeholder={`Mục ${idx + 1}…`}
                />
                {checklist.length > 1 && (
                  <Button
                    type="button" variant="ghost" size="icon"
                    onClick={() => setChecklist(prev => prev.filter((_, i) => i !== idx))}
                  >
                    <X />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button" variant="ghost" size="sm"
              className="gap-1.5"
              onClick={() => setChecklist(prev => [...prev, ''])}
            >
              <Plus className="size-3.5" /> Thêm mục
            </Button>
          </CardContent>
        </Card>

        {/* Bài liên quan */}
        <Card>
          <CardHeader>
            <CardTitle>Bài viết liên quan</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedPool.filter(p => !editingSlug || p.slug !== editingSlug).length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có bài viết nào để liên kết.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {relatedPool
                  .filter(p => !editingSlug || p.slug !== editingSlug)
                  .map(p => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => setRelatedSlugs(prev =>
                        prev.includes(p.slug) ? prev.filter(s => s !== p.slug) : [...prev, p.slug]
                      )}
                      className="inline-flex"
                    >
                      <Badge
                        variant={relatedSlugs.includes(p.slug) ? 'default' : 'outline'}
                        className="cursor-pointer transition-colors"
                      >
                        {p.title.length > 45 ? p.title.slice(0, 45) + '…' : p.title}
                      </Badge>
                    </button>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error */}
        {formError && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {formError}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => setMode('list')} className="rounded-full px-5">
            Huỷ
          </Button>
          <Button type="submit" disabled={saving} className="rounded-full px-6 gap-2">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? 'Đang lưu…' : editingSlug ? 'Cập nhật bài viết' : 'Đăng bài viết'}
          </Button>
        </div>
      </form>
    </div>
  )
}
