import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { mapDiscussionPost, fetchPostsByIds } from '@/lib/discussion-mapper'
import { readVote, toUserVote } from '@/lib/vote-helpers'

async function resolveUid(identifier: string): Promise<string> {
  const snap = await db.ref('userProfiles').get()
  if (snap.exists()) {
    let byUsername: string | null = null
    snap.forEach((child) => {
      if ((child.val() as Record<string, unknown>).username === identifier) {
        byUsername = child.key!
        return true
      }
    })
    if (byUsername) return byUsername
  }
  return identifier
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ identifier: string }> },
) {
  try {
    const { identifier } = await params
    const uid = await resolveUid(identifier)

    const commentSnap = await db.ref(`userCommentPosts/${uid}`).get()
    if (!commentSnap.exists()) return NextResponse.json({ posts: [] })

    const entries: { id: string; at: number }[] = []
    commentSnap.forEach((child) => {
      entries.push({ id: child.key!, at: (child.val() as { lastCommentAt?: number })?.lastCommentAt ?? 0 })
    })
    entries.sort((a, b) => b.at - a.at)
    const postIds = entries.map((e) => e.id)

    const raw = await fetchPostsByIds(db, postIds)
    const validIds = postIds.filter((id) => {
      const d = raw[id]
      return d && d.status === 'approved' && !d.hiddenByMod && !d.archived
    })
    if (validIds.length === 0) return NextResponse.json({ posts: [] })

    const decoded = await verifyRequest(req)
    const viewerUid = decoded?.uid ?? null

    const savedSet = new Set<string>()
    if (viewerUid) {
      const savedSnap = await db.ref(`userSaved/${viewerUid}`).get()
      if (savedSnap.exists()) savedSnap.forEach((c) => { savedSet.add(c.key!); return false })
    }

    const posts = await Promise.all(
      validIds.map(async (id) => {
        const d = raw[id]
        let userVote = null
        if (viewerUid) {
          const vSnap = await db.ref(`votes/${id}/${viewerUid}`).get()
          if (vSnap.exists()) userVote = toUserVote(readVote(vSnap.val()))
        }
        return mapDiscussionPost(id, d, { userVote, isSaved: savedSet.has(id) })
      }),
    )

    const ordered = validIds.map((id) => posts.find((p) => p.id === id)).filter(Boolean)
    return NextResponse.json({ posts: ordered })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
