import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

function makeInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export async function GET(req: NextRequest) {
  try {
    const sort = req.nextUrl.searchParams.get('sort') || 'newest'
    const snapshot = await db.ref('discussions').get()

    if (!snapshot.exists()) return NextResponse.json({ posts: [] })

    const posts: ReturnType<typeof mapPost>[] = []
    snapshot.forEach((child) => {
      posts.push(mapPost(child.key!, child.val()))
    })

    if (sort === 'top') {
      posts.sort((a, b) => b.upvoteCount - a.upvoteCount)
    } else {
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return NextResponse.json({ posts: posts.slice(0, 50) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

function mapPost(id: string, d: Record<string, unknown>) {
  return {
    id,
    title: d.title as string,
    description: (d.description as string) ?? '',
    author: d.isAnonymous ? 'Ẩn danh' : (d.author as string),
    authorInitials: d.isAnonymous ? '?' : (d.authorInitials as string),
    photoURL: d.isAnonymous ? null : ((d.photoURL as string) ?? null),
    uid: (d.uid as string) ?? null,
    isAnonymous: (d.isAnonymous as boolean) ?? false,
    category: (d.category as string) ?? 'Chung',
    tags: (d.tags as string[]) ?? [],
    upvoteCount: (d.upvoteCount as number) ?? 0,
    commentCount: (d.commentCount as number) ?? 0,
    createdAt: new Date(d.createdAt as number).toISOString(),
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description, category, tags, isAnonymous } = await req.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

    const displayName = decoded.name ?? decoded.email ?? 'Unknown'
    const newRef = db.ref('discussions').push()

    await newRef.set({
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
      createdAt: Date.now(),
    })

    return NextResponse.json({ id: newRef.key })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
