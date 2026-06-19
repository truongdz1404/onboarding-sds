import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

function makeInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const snapshot = await db.ref(`comments/${id}`).orderByChild('createdAt').get()

    const comments: Record<string, unknown>[] = []
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const d = child.val() as Record<string, unknown>
        comments.push({
          id: child.key,
          postId: id,
          content: d.content,
          author: d.isAnonymous ? 'Ẩn danh' : d.author,
          authorInitials: d.isAnonymous ? '?' : d.authorInitials,
          photoURL: d.isAnonymous ? null : ((d.photoURL as string) ?? null),
          isAnonymous: (d.isAnonymous as boolean) ?? false,
          createdAt: new Date(d.createdAt as number).toISOString(),
        })
      })
    }

    return NextResponse.json({ comments })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { content, isAnonymous } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Missing content' }, { status: 400 })

    const displayName = decoded.name ?? decoded.email ?? 'Unknown'
    const newRef = db.ref(`comments/${id}`).push()

    await newRef.set({
      content: content.trim(),
      author: displayName,
      authorInitials: makeInitials(displayName),
      photoURL: decoded.picture ?? null,
      uid: decoded.uid,
      isAnonymous: isAnonymous ?? false,
      createdAt: Date.now(),
    })

    await db.ref(`discussions/${id}/commentCount`).transaction(
      (count: number | null) => (count ?? 0) + 1,
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
