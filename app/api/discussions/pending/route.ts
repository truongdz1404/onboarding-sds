import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { mapDiscussionPost } from '@/lib/discussion-mapper'
import { readVote, toUserVote } from '@/lib/vote-helpers'

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
    const snapshot = await db.ref('discussions').get()

    if (!snapshot.exists()) return NextResponse.json({ posts: [] })

    const posts: ReturnType<typeof mapDiscussionPost>[] = []
    snapshot.forEach((child) => {
      const d = child.val() as Record<string, unknown>
      if (d.archived) return
      if (status === 'pending' && d.status !== 'pending') return
      if (status === 'approved' && d.status !== 'approved') return
      posts.push(mapDiscussionPost(child.key!, d))
    })

    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    await Promise.all(
      posts.map(async (post) => {
        const snap = await db.ref(`votes/${post.id}/${decoded.uid}`).get()
        post.userVote = toUserVote(readVote(snap.val()))
      }),
    )

    return NextResponse.json({ posts })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
