'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, Pencil, Trash2, Tags } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DiscussionTopic } from '@/lib/discussion-types'

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

const COLOR_OPTIONS: { bg: string; fg: string; name: string; preview: string }[] = [
  { bg: 'bg-sky-100',    fg: 'text-sky-600',    name: 'Sky',    preview: 'bg-sky-400' },
  { bg: 'bg-violet-100', fg: 'text-violet-600', name: 'Violet', preview: 'bg-violet-400' },
  { bg: 'bg-amber-100',  fg: 'text-amber-600',  name: 'Amber',  preview: 'bg-amber-400' },
  { bg: 'bg-green-100',  fg: 'text-green-600',  name: 'Green',  preview: 'bg-green-400' },
  { bg: 'bg-rose-100',   fg: 'text-rose-600',   name: 'Rose',   preview: 'bg-rose-400' },
  { bg: 'bg-teal-100',   fg: 'text-teal-600',   name: 'Teal',   preview: 'bg-teal-400' },
  { bg: 'bg-orange-100', fg: 'text-orange-600', name: 'Orange', preview: 'bg-orange-400' },
  { bg: 'bg-purple-100', fg: 'text-purple-600', name: 'Purple', preview: 'bg-purple-400' },
  { bg: 'bg-pink-100',   fg: 'text-pink-600',   name: 'Pink',   preview: 'bg-pink-400' },
  { bg: 'bg-indigo-100', fg: 'text-indigo-600', name: 'Indigo', preview: 'bg-indigo-400' },
  { bg: 'bg-cyan-100',   fg: 'text-cyan-600',   name: 'Cyan',   preview: 'bg-cyan-400' },
  { bg: 'bg-lime-100',   fg: 'text-lime-600',   name: 'Lime',   preview: 'bg-lime-400' },
]

const PRESET_ICONS: { label: string; path: string }[] = [
  { label: 'Globe',    path: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.485 0 4-4.03 4-9s-1.515-9-4-9m0 18c-2.485 0-4-4.03-4-9s1.515-9 4-9m-9 9h18' },
  { label: 'Code',     path: 'm16 18 4-4-4-4M8 6 4 10l4 4' },
  { label: 'Q&A',      path: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z' },
  { label: 'Person',   path: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' },
  { label: 'Box',      path: 'm21 7.5-9-4.5L3 7.5m18 0-9 4.5m9-4.5v9l-9 4.5M3 7.5l9 4.5M3 7.5v9l9 4.5m0-9v9' },
  { label: 'Book',     path: 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25' },
  { label: 'Calendar', path: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5' },
  { label: 'Star',     path: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z' },
  { label: 'Lightning',path: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z' },
  { label: 'Heart',    path: 'm11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z' },
  { label: 'Trophy',   path: 'M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0' },
  { label: 'Chart',    path: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' },
]

function TopicIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className ?? 'size-[14px]'}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={path} />
    </svg>
  )
}

interface FormState {
  value: string
  bg: string
  fg: string
  iconPath: string
  order: number
}

const DEFAULT_FORM: FormState = {
  value: '',
  bg: 'bg-sky-100',
  fg: 'text-sky-600',
  iconPath: PRESET_ICONS[0].path,
  order: 99,
}

interface TopicDialogProps {
  topic?: DiscussionTopic | null
  onClose: () => void
  onSaved: () => void
}

function TopicDialog({ topic, onClose, onSaved }: TopicDialogProps) {
  const isEdit = !!topic
  const [form, setForm] = useState<FormState>(
    topic
      ? { value: topic.value, bg: topic.bg, fg: topic.fg, iconPath: topic.iconPath, order: topic.order }
      : DEFAULT_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedColor = COLOR_OPTIONS.find((c) => c.bg === form.bg)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.value.trim()) { setError('Vui lòng nhập tên chủ đề'); return }
    setSaving(true)
    setError('')
    try {
      const token = await getIdToken()
      const url = isEdit ? `/api/topics/${topic!.id}` : '/api/topics'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Có lỗi xảy ra')
        return
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">{isEdit ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề mới'}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Preview */}
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <span className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', form.bg, form.fg)}>
              <TopicIcon path={form.iconPath} />
            </span>
            <span className="text-sm font-medium text-gray-700">
              {form.value ? `p/${form.value.toLowerCase().replace(/\s+/g, '-')}` : 'p/ten-chu-de'}
            </span>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tên chủ đề</label>
            <input
              type="text"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              placeholder="Ví dụ: Kỹ thuật"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Order */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Thứ tự hiển thị</label>
            <input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Color */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Màu sắc</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.bg}
                  type="button"
                  title={c.name}
                  onClick={() => setForm((f) => ({ ...f, bg: c.bg, fg: c.fg }))}
                  className={cn(
                    'h-7 w-7 rounded-full transition-all',
                    c.preview,
                    form.bg === c.bg ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : 'hover:scale-110'
                  )}
                />
              ))}
            </div>
            {selectedColor && (
              <p className="mt-1.5 text-xs text-gray-400">Đang chọn: {selectedColor.name}</p>
            )}
          </div>

          {/* Icon */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon.label}
                  type="button"
                  title={icon.label}
                  onClick={() => setForm((f) => ({ ...f, iconPath: icon.path }))}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
                    form.iconPath === icon.path
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <TopicIcon path={icon.path} className="size-4" />
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 hover:bg-primary/90"
            >
              {saving && <Loader2 className="animate-spin" size={14} />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo chủ đề'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface DeleteConfirmProps {
  topic: DiscussionTopic
  onClose: () => void
  onDeleted: () => void
}

function DeleteConfirm({ topic, onClose, onDeleted }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/topics/${topic.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) onDeleted()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-gray-900">Xoá chủ đề?</h2>
        <p className="mt-2 text-sm text-gray-500">
          Xoá <span className="font-medium text-gray-700">{topic.label}</span>. Các bài viết thuộc chủ đề này sẽ không bị xoá nhưng sẽ không còn danh mục.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 hover:bg-red-600"
          >
            {deleting && <Loader2 className="animate-spin" size={14} />}
            Xoá
          </button>
        </div>
      </div>
    </div>
  )
}

export function TopicManagementView() {
  const [topics, setTopics] = useState<DiscussionTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [dialog, setDialog] = useState<'add' | 'edit' | null>(null)
  const [editingTopic, setEditingTopic] = useState<DiscussionTopic | null>(null)
  const [deletingTopic, setDeletingTopic] = useState<DiscussionTopic | null>(null)

  const fetchTopics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/topics')
      const data = await res.json()
      setTopics(data.topics ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTopics() }, [fetchTopics])

  async function handleSeed() {
    setSeeding(true)
    try {
      const token = await getIdToken()
      await fetch('/api/topics/seed', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      await fetchTopics()
    } finally {
      setSeeding(false)
    }
  }

  function openAdd() { setDialog('add'); setEditingTopic(null) }
  function openEdit(t: DiscussionTopic) { setEditingTopic(t); setDialog('edit') }
  function closeDialog() { setDialog(null); setEditingTopic(null) }

  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#f0f0f0] bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-md shadow-indigo-500/30">
            <Tags size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-bold text-[#1f2937]" style={{ fontSize: '17px' }}>Quản lý chủ đề thảo luận</h1>
            <p className="mt-0.5 text-[13px] text-[#6b7280]">{topics.length} chủ đề đang có</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex flex-shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition-all hover:bg-primary/90"
        >
          <Plus size={15} strokeWidth={2.5} />
          Thêm chủ đề
        </button>
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : topics.length === 0 ? (
          <div className="py-20 text-center">
            <Tags size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-800">Chưa có chủ đề nào</p>
            <p className="mt-1 text-sm text-gray-400">Thêm chủ đề mới hoặc khởi tạo dữ liệu mặc định.</p>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {seeding && <Loader2 className="animate-spin" size={14} />}
              Khởi tạo 7 chủ đề mặc định
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f0f0f0]">
            {topics.map((topic) => (
              <div key={topic.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#f6f7f8]">
                {/* Icon preview */}
                <span className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg', topic.bg, topic.fg)}>
                  <TopicIcon path={topic.iconPath} className="size-[15px]" />
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{topic.value}</p>
                  <p className="text-xs text-gray-400">{topic.label} · thứ tự {topic.order}</p>
                </div>

                {/* Color swatch */}
                <div className={cn('h-5 w-5 rounded-full', topic.bg.replace('100', '400'))} title={`${topic.bg} / ${topic.fg}`} />

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(topic)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingTopic(topic)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Xoá"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {(dialog === 'add' || dialog === 'edit') && (
        <TopicDialog
          topic={dialog === 'edit' ? editingTopic : null}
          onClose={closeDialog}
          onSaved={() => { closeDialog(); fetchTopics() }}
        />
      )}
      {deletingTopic && (
        <DeleteConfirm
          topic={deletingTopic}
          onClose={() => setDeletingTopic(null)}
          onDeleted={() => { setDeletingTopic(null); fetchTopics() }}
        />
      )}
    </div>
  )
}
