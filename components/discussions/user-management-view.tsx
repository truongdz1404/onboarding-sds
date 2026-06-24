'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Users, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/profile-types'

interface UserItem {
  uid: string
  name: string
  email: string
  photoURL: string | null
  role: UserRole
}

async function getIdToken() {
  const { auth } = await import('@/lib/firebase-client')
  return auth.currentUser?.getIdToken() ?? null
}

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string; color: string }[] = [
  {
    value: 'admin',
    label: 'Admin',
    desc: 'Toàn quyền quản trị, gán role cho thành viên',
    color: 'text-purple-700',
  },
  {
    value: 'moderator',
    label: 'Moderator',
    desc: 'Kiểm duyệt và phê duyệt bài viết',
    color: 'text-amber-700',
  },
  {
    value: 'user',
    label: 'Thành viên',
    desc: 'Đăng bài, bình luận, vote',
    color: 'text-gray-600',
  },
]

const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  moderator: 'bg-amber-100 text-amber-700',
  user: 'bg-gray-100 text-gray-600',
}

interface RoleDialogProps {
  user: UserItem
  onClose: () => void
  onSave: (uid: string, role: UserRole) => Promise<void>
}

function RoleDialog({ user, onClose, onSave }: RoleDialogProps) {
  const [selected, setSelected] = useState<UserRole>(user.role)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (selected === user.role) { onClose(); return }
    setSaving(true)
    await onSave(user.uid, selected)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[#f0f0f0] bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Phân quyền</h2>
            <p className="mt-0.5 text-sm text-gray-500">{user.name || user.email}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Role options */}
        <div className="flex flex-col gap-2">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors',
                selected === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-[#f0f0f0] hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              <span className={cn(
                'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                selected === opt.value ? 'border-primary bg-primary' : 'border-gray-300',
              )}>
                {selected === opt.value && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              <div>
                <p className={cn('text-sm font-semibold', opt.color)}>{opt.label}</p>
                <p className="mt-0.5 text-xs text-gray-400">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  )
}

export function UserManagementView() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogUser, setDialogUser] = useState<UserItem | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      const res = await fetch('/api/admin/users', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setUsers(data.users ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleSaveRole(uid: string, role: UserRole) {
    const token = await getIdToken()
    const res = await fetch(`/api/admin/users/${uid}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ role }),
    })
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)))
    }
  }

  return (
    <>
      {dialogUser && (
        <RoleDialog
          user={dialogUser}
          onClose={() => setDialogUser(null)}
          onSave={handleSaveRole}
        />
      )}

      <div className="flex-1 min-w-0">
        {/* Banner */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#f0f0f0] bg-white px-6 py-5 shadow-sm">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
            <Users size={24} strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-bold text-[#1f2937]" style={{ fontSize: '17px', lineHeight: '1.3' }}>
              Quản lý người dùng
            </h1>
            <p className="mt-0.5 text-[13px] text-[#6b7280]">
              Phân quyền cho thành viên
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-purple-600" size={24} />
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">Không có người dùng nào</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white">
            <div className="divide-y divide-[#f0f0f0]">
              {users.map((user) => (
                <div key={user.uid} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-primary/10">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.name}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                        {user.name?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{user.name || 'Unnamed'}</p>
                    <p className="truncate text-xs text-gray-400">{user.email}</p>
                  </div>

                  <span className={cn('flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold', ROLE_BADGE[user.role])}>
                    {ROLE_OPTIONS.find((o) => o.value === user.role)?.label}
                  </span>

                  <button
                    onClick={() => setDialogUser(user)}
                    className="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Phân quyền
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
