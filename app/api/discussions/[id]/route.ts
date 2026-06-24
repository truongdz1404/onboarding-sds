import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

async function getRole(uid: string) {
  const snap = await db.ref(`userRoles/${uid}/role`).get()
  return (snap.val() as string) ?? 'user'
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const snapshot = await db.ref(`discussions/${id}`).get()
    if (!snapshot.exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const d = snapshot.val() as Record<string, unknown>

    if (d.status === 'pending') {
      const decoded = await verifyRequest(req)
      if (!decoded) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const role = await getRole(decoded.uid)
      if (role !== 'admin' && role !== 'moderator' && decoded.uid !== (d.uid as string)) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }

    return NextResponse.json({
      post: {
        id,
        title: d.title,
        description: (d.description as string) ?? '',
        author: d.isAnonymous ? 'Ẩn danh' : d.author,
        authorInitials: d.isAnonymous ? '?' : d.authorInitials,
        photoURL: d.isAnonymous ? null : ((d.photoURL as string) ?? null),
        uid: (d.uid as string) ?? null,
        isAnonymous: (d.isAnonymous as boolean) ?? false,
        category: (d.category as string) ?? 'Chung',
        tags: (d.tags as string[]) ?? [],
        upvoteCount: (d.upvoteCount as number) ?? 0,
        commentCount: (d.commentCount as number) ?? 0,
        createdAt: new Date(d.createdAt as number).toISOString(),
        status: (d.status as string) ?? undefined,
        moderatedAt: d.moderatedAt ? new Date(d.moderatedAt as number).toISOString() : undefined,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
