import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { mapDiscussionPost } from '@/lib/discussion-mapper'
import { readVote, toUserVote } from '@/lib/vote-helpers'

const PAGE_SIZE = 10

async function getRole(uid: string) {
  const snap = await db.ref(`userRoles/${uid}/role`).get()
  return (snap.val() as string) ?? 'user'
}

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = await getRole(decoded.uid)
    if (role !== 'admin' && role !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const status = req.nextUrl.searchParams.get('status') || 'pending'
    const pageParam = req.nextUrl.searchParams.get('page')

    const snapshot = await db.ref('discussions').get()
    if (!snapshot.exists()) return NextResponse.json({ posts: [], hasMore: false })

    const allPosts: ReturnType<typeof mapDiscussionPost>[] = []
    snapshot.forEach((child) => {
      const d = child.val() as Record<string, unknown>
      if (d.archived) return
      if (status === 'pending' && d.status !== 'pending') return
      if (status === 'approved' && d.status !== 'approved') return
      allPosts.push(mapDiscussionPost(child.key!, d))
    })

    allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    let posts: typeof allPosts
    let hasMore = false

    if (pageParam !== null) {
      const page = Math.max(0, parseInt(pageParam, 10))
      const start = page * PAGE_SIZE
      posts = allPosts.slice(start, start + PAGE_SIZE)
      hasMore = start + PAGE_SIZE < allPosts.length
    } else {
      posts = allPosts
    }

    await Promise.all(
      posts.map(async (post) => {
        const snap = await db.ref(`votes/${post.id}/${decoded.uid}`).get()
        post.userVote = toUserVote(readVote(snap.val()))
      }),
    )

    return NextResponse.json({ posts, hasMore })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
