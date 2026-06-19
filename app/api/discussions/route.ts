import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { Timestamp } from 'firebase-admin/firestore'

function makeInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export async function GET(req: NextRequest) {
  try {
    const sort = req.nextUrl.searchParams.get('sort') || 'newest'
    const field = sort === 'top' ? 'upvoteCount' : 'createdAt'

    const snapshot = await db.collection('discussions').orderBy(field, 'desc').limit(50).get()

    const posts = snapshot.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        title: d.title,
        description: d.description ?? '',
        author: d.isAnonymous ? 'Ẩn danh' : d.author,
        authorInitials: d.isAnonymous ? '?' : d.authorInitials,
        photoURL: d.isAnonymous ? null : (d.photoURL ?? null),
        uid: d.uid ?? null,
        isAnonymous: d.isAnonymous ?? false,
        category: d.category,
        tags: d.tags ?? [],
        upvoteCount: d.upvoteCount ?? 0,
        commentCount: d.commentCount ?? 0,
        createdAt: (d.createdAt as Timestamp).toDate().toISOString(),
      }
    })

    return NextResponse.json({ posts })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description, category, tags, isAnonymous } = await req.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

    const displayName = decoded.name ?? decoded.email ?? 'Unknown'

    const ref = await db.collection('discussions').add({
      title: title.trim(),
      description: description?.trim() ?? '',
      author: displayName,
      authorInitials: makeInitials(displayName),
      photoURL: decoded.picture ?? null,
      uid: decoded.uid,
      isAnonymous: isAnonymous ?? false,
      category: category ?? 'Chung',
      tags: Array.isArray(tags) ? tags : [],
      upvoteCount: 0,
      commentCount: 0,
      createdAt: new Date(),
    })

    return NextResponse.json({ id: ref.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
