import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

export async function GET() {
  const snapshot = await db.ref('blogPosts').get()
  if (!snapshot.exists()) return NextResponse.json({ posts: [] })

  const data: Record<string, unknown> = snapshot.val()
  const posts = Object.entries(data)
    .filter(([, v]) => typeof v === 'object' && v !== null && 'title' in (v as object))
    .map(([slug, post]) => ({ ...(post as object), slug }))
    .sort((a: any, b: any) =>
      new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()
    )

  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest) {
  const decoded = await verifyRequest(req)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const roleSnap = await db.ref(`userRoles/${decoded.uid}/role`).get()
  if (roleSnap.val() !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { slug, ...rest } = body

  if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 })

  const today = new Date().toISOString().split('T')[0]
  await db.ref(`blogPosts/${slug}`).set({
    ...rest,
    slug,
    views: '0',
    viewCount: 0,
    publishedAt: today,
    updatedAt: today,
  })

  return NextResponse.json({ success: true, slug })
}
