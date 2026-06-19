import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'

function makeInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const snapshot = await db
      .collection('discussions').doc(id)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .get()

    const comments = snapshot.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        postId: id,
        content: d.content,
        author: d.isAnonymous ? 'Ẩn danh' : d.author,
        authorInitials: d.isAnonymous ? '?' : d.authorInitials,
        photoURL: d.isAnonymous ? null : (d.photoURL ?? null),
        isAnonymous: d.isAnonymous ?? false,
        createdAt: (d.createdAt as Timestamp).toDate().toISOString(),
      }
    })

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

    await db
      .collection('discussions').doc(id)
      .collection('comments')
      .add({
        content: content.trim(),
        author: displayName,
        authorInitials: makeInitials(displayName),
        photoURL: decoded.picture ?? null,
        uid: decoded.uid,
        isAnonymous: isAnonymous ?? false,
        createdAt: new Date(),
      })

    await db.collection('discussions').doc(id).update({
      commentCount: FieldValue.increment(1),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
