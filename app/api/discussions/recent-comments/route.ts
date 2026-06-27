import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const snap = await db.ref('recentComments').get()
    const all: Record<string, unknown>[] = []
    if (snap.exists()) {
      snap.forEach((child) => {
        const d = child.val() as Record<string, unknown>
        all.push({ ...d, id: child.key })
      })
    }

    // Run post visibility checks and comment deletion checks in parallel
    const postIds = [...new Set(all.map((c) => c.postId as string).filter(Boolean))]
    const [postStatuses, commentStatuses] = await Promise.all([
      Promise.all(
        postIds.map(async (id) => {
          const postSnap = await db.ref(`discussions/${id}`).get()
          if (!postSnap.exists()) return { id, hidden: true }
          const post = postSnap.val() as Record<string, unknown>
          return { id, hidden: post.hiddenByMod === true || post.archived === true }
        }),
      ),
      Promise.all(
        all.map(async (c) => {
          const snap = await db.ref(`comments/${c.postId}/${c.commentId}`).get()
          if (!snap.exists()) return { id: c.id as string, deleted: true }
          const data = snap.val() as Record<string, unknown>
          return { id: c.id as string, deleted: data.deleted === true }
        }),
      ),
    ])

    const hiddenPostIds = new Set(postStatuses.filter((p) => p.hidden).map((p) => p.id))
    const deletedCommentIds = new Set(commentStatuses.filter((c) => c.deleted).map((c) => c.id))

    const comments = all
      .filter(
        (c) =>
          !hiddenPostIds.has(c.postId as string) &&
          !deletedCommentIds.has(c.id as string),
      )
      .sort((a, b) => (b.createdAt as number) - (a.createdAt as number))
      .slice(0, 30)
      .map((d) => ({ ...d, createdAt: new Date(d.createdAt as number).toISOString() }))

    return NextResponse.json({ comments })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
