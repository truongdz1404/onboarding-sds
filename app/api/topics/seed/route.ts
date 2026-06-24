import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

async function getRole(uid: string) {
  const snap = await db.ref(`userRoles/${uid}/role`).get()
  return (snap.val() as string) ?? 'user'
}

const SEED_TOPICS = [
  {
    value: 'Chung',
    slug: 'chung',
    label: 'p/chung',
    bg: 'bg-sky-100',
    fg: 'text-sky-600',
    iconPath: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.485 0 4-4.03 4-9s-1.515-9-4-9m0 18c-2.485 0-4-4.03-4-9s1.515-9 4-9m-9 9h18',
    order: 1,
  },
  {
    value: 'Kỹ thuật',
    slug: 'ky-thuat',
    label: 'p/ky-thuat',
    bg: 'bg-violet-100',
    fg: 'text-violet-600',
    iconPath: 'm16 18 4-4-4-4M8 6 4 10l4 4',
    order: 2,
  },
  {
    value: 'Hỏi & Đáp',
    slug: 'hoi-dap',
    label: 'p/hoi-dap',
    bg: 'bg-amber-100',
    fg: 'text-amber-600',
    iconPath: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z',
    order: 3,
  },
  {
    value: 'Giới thiệu',
    slug: 'gioi-thieu',
    label: 'p/gioi-thieu',
    bg: 'bg-green-100',
    fg: 'text-green-600',
    iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
    order: 4,
  },
  {
    value: 'Sản phẩm',
    slug: 'san-pham',
    label: 'p/san-pham',
    bg: 'bg-rose-100',
    fg: 'text-rose-600',
    iconPath: 'm21 7.5-9-4.5L3 7.5m18 0-9 4.5m9-4.5v9l-9 4.5M3 7.5l9 4.5M3 7.5v9l9 4.5m0-9v9',
    order: 5,
  },
  {
    value: 'Kinh nghiệm',
    slug: 'kinh-nghiem',
    label: 'p/kinh-nghiem',
    bg: 'bg-teal-100',
    fg: 'text-teal-600',
    iconPath: 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
    order: 6,
  },
  {
    value: 'Hoạt động',
    slug: 'hoat-dong',
    label: 'p/hoat-dong',
    bg: 'bg-orange-100',
    fg: 'text-orange-600',
    iconPath: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
    order: 7,
  },
]

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = await getRole(decoded.uid)
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const existing = await db.ref('discussionTopics').get()
    if (existing.exists()) {
      return NextResponse.json({ message: 'Topics already exist, skipping seed', count: 0 })
    }

    const now = new Date().toISOString()
    for (const topic of SEED_TOPICS) {
      const ref = db.ref('discussionTopics').push()
      await ref.set({ ...topic, createdAt: now })
    }

    return NextResponse.json({ message: 'Seeded successfully', count: SEED_TOPICS.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to seed topics' }, { status: 500 })
  }
}
