'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2, Info } from 'lucide-react'
import Image from 'next/image'
import type { UserProfile, ProfileLink } from '@/lib/profile-types'

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

interface ProfileOverviewProps {
  profile: UserProfile
  onUpdate: (profile: UserProfile) => void
}

export function ProfileOverview({ profile, onUpdate }: ProfileOverviewProps) {
  const [name, setName] = useState(profile.name)
  const [username, setUsername] = useState(profile.username)
  const [headline, setHeadline] = useState(profile.headline)
  const [about, setAbout] = useState(profile.about)
  const [links, setLinks] = useState<ProfileLink[]>(profile.links)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setName(profile.name)
    setUsername(profile.username)
    setHeadline(profile.headline)
    setAbout(profile.about)
    setLinks(profile.links)
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const token = await getIdToken()
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, username, headline, about, links }),
      })
      const data = await res.json()
      if (res.ok) {
        onUpdate(data.profile)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } finally {
      setSaving(false)
    }
  }

  function addLink() {
    setLinks((prev) => [...prev, { label: '', url: '' }])
  }

  function updateLink(i: number, field: keyof ProfileLink, value: string) {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))
  }

  function removeLink(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i))
  }

  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="rounded-2xl border border-[#f0f0f0] bg-white p-6 sm:p-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
        {saved && <span className="text-sm font-medium text-green-600">Đã lưu!</span>}
      </div>

      <form onSubmit={handleSave}>
        {/* Avatar row */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">Tên</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                placeholder="Họ và tên"
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <div className="h-20 w-20 overflow-hidden rounded-full ring-2 ring-gray-100">
              {profile.photoURL ? (
                <Image src={profile.photoURL} alt="" width={80} height={80} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-primary text-2xl font-bold text-white">{initials || '?'}</span>
              )}
            </div>
            <button type="button" disabled className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-400 cursor-not-allowed">
              Tải avatar mới
            </button>
            <p className="text-[11px] text-gray-400">Khuyến nghị: 400×400px · Sẽ có sau</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              Tên người dùng
              <Info size={13} className="text-gray-400" />
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '_'))}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="username"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">Tiêu đề</label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="Một dòng giới thiệu ngắn về bạn"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">Giới thiệu</label>
            <textarea
              rows={5}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="Chia sẻ với cộng đồng về bản thân, mục tiêu và đam mê của bạn."
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Liên kết bổ sung</h3>
            <div className="space-y-3">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={link.label}
                    onChange={(e) => updateLink(i, 'label', e.target.value)}
                    placeholder="Nhãn"
                    className="w-1/3 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary/40"
                  />
                  <input
                    value={link.url}
                    onChange={(e) => updateLink(i, 'url', e.target.value)}
                    placeholder="https://"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary/40"
                  />
                  <button type="button" onClick={() => removeLink(i)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLink}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Plus size={14} /> Thêm liên kết
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  )
}
