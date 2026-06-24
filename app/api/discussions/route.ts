import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { readVote, toUserVote } from '@/lib/vote-helpers'

function makeInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

import { mapDiscussionPost } from '@/lib/discussion-mapper'

const PAGE_SIZE = 10

export async function GET(req: NextRequest) {
  try {
    const sort = req.nextUrl.searchParams.get('sort') || 'newest'
    const pageParam = req.nextUrl.searchParams.get('page')
    const category = req.nextUrl.searchParams.get('category')

    const snapshot = await db.ref('discussions').get()
    if (!snapshot.exists()) return NextResponse.json({ posts: [], hasMore: false })

    const allPosts: ReturnType<typeof mapDiscussionPost>[] = []
    snapshot.forEach((child) => {
      const d = child.val() as Record<string, unknown>
      if (d.archived) return
      if (d.status && d.status !== 'approved') return
      allPosts.push(mapDiscussionPost(child.key!, d))
    })

    if (sort === 'top') {
      allPosts.sort((a, b) => b.upvoteCount - a.upvoteCount)
    } else {
      allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    const filtered = category ? allPosts.filter((p) => p.category === category) : allPosts

    let posts: typeof filtered
    let hasMore = false

    if (pageParam !== null) {
      const page = Math.max(0, parseInt(pageParam, 10))
      const start = page * PAGE_SIZE
      posts = filtered.slice(start, start + PAGE_SIZE)
      hasMore = start + PAGE_SIZE < filtered.length
    } else {
      // No pagination — return all (used by search-view)
      posts = filtered
    }

    const decoded = await verifyRequest(req)
    if (decoded && posts.length > 0) {
      await Promise.all(
        posts.map(async (post) => {
          const snap = await db.ref(`votes/${post.id}/${decoded.uid}`).get()
          post.userVote = toUserVote(readVote(snap.val()))
        }),
      )
    }

    return NextResponse.json({ posts, hasMore })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description, category, tags, isAnonymous, media, isDraft } = await req.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

    const displayName = decoded.name ?? decoded.email ?? 'Unknown'
    const newRef = db.ref('discussions').push()

    const cleanMedia = Array.isArray(media)
      ? media.filter((m: unknown) => m && typeof (m as {url:unknown}).url === 'string' && ['image','video'].includes((m as {type:unknown}).type as string))
      : []

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
      media: cleanMedia,
      upvoteCount: 0,
      commentCount: 0,
      createdAt: Date.now(),
      status: isDraft ? 'draft' : 'pending',
    })

    return NextResponse.json({ id: newRef.key })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
