import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { mapDiscussionPost } from '@/lib/discussion-mapper'
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

    const decoded = await verifyRequest(req)
    const viewerUid = decoded?.uid ?? null

    const savedSet = new Set<string>()
    if (viewerUid) {
      const savedSnap = await db.ref(`userSaved/${viewerUid}`).get()
      if (savedSnap.exists()) savedSnap.forEach((c) => { savedSet.add(c.key!); return false })
    }

    const snap = await db.ref('discussions').get()
    const raw: { id: string; d: Record<string, unknown> }[] = []
    if (snap.exists()) {
      snap.forEach((child) => {
        const d = child.val() as Record<string, unknown>
        if (d.uid === uid && d.status === 'approved' && !d.hiddenByMod && !d.archived) {
          raw.push({ id: child.key!, d })
        }
      })
    }
    raw.sort((a, b) => ((b.d.createdAt as number) ?? 0) - ((a.d.createdAt as number) ?? 0))

    const posts = await Promise.all(
      raw.map(async ({ id, d }) => {
        let userVote = null
        if (viewerUid) {
          const vSnap = await db.ref(`votes/${id}/${viewerUid}`).get()
          if (vSnap.exists()) userVote = toUserVote(readVote(vSnap.val()))
        }
        return mapDiscussionPost(id, d, { userVote, isSaved: savedSet.has(id) })
      }),
    )

    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json({ posts })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
