import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import type { DiscussionTopic } from '@/lib/discussion-types'

async function getRole(uid: string) {
  const snap = await db.ref(`userRoles/${uid}/role`).get()
  return (snap.val() as string) ?? 'user'
}

const VI_MAP: Record<string, string> = {
  'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
  'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
  'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
  'đ': 'd',
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((c) => VI_MAP[c] ?? c)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET() {
  try {
    const snap = await db.ref('discussionTopics').get()
    if (!snap.exists()) return NextResponse.json({ topics: [] })

    const topics: DiscussionTopic[] = []
    snap.forEach((child) => {
      topics.push({ id: child.key!, ...(child.val() as Omit<DiscussionTopic, 'id'>) })
    })
    topics.sort((a, b) => a.order - b.order)

    return NextResponse.json({ topics })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = await getRole(decoded.uid)
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { value, bg, fg, iconPath, order } = await req.json()
    if (!value?.trim()) return NextResponse.json({ error: 'Missing value' }, { status: 400 })

    const slug = slugify(value.trim())
    const label = `p/${slug}`
    const newRef = db.ref('discussionTopics').push()
    const topic = {
      label,
      value: value.trim(),
      slug,
      bg: bg ?? 'bg-sky-100',
      fg: fg ?? 'text-sky-600',
      iconPath: iconPath ?? '',
      order: order ?? 99,
      createdAt: new Date().toISOString(),
    }
    await newRef.set(topic)

    return NextResponse.json({ topic: { id: newRef.key, ...topic } }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
  }
}
