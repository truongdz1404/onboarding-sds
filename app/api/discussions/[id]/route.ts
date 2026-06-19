import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const doc = await db.collection('discussions').doc(id).get()
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const d = doc.data()!
    return NextResponse.json({
      post: {
        id: doc.id,
        title: d.title,
        description: d.description ?? '',
        author: d.author,
        authorInitials: d.authorInitials,
        category: d.category,
        tags: d.tags ?? [],
        upvoteCount: d.upvoteCount ?? 0,
        commentCount: d.commentCount ?? 0,
        createdAt: (d.createdAt as Timestamp).toDate().toISOString(),
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
