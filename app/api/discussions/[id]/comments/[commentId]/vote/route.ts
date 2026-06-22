import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { fromUserVote, readVote, toUserVote, voteDelta, type VoteDirection } from '@/lib/vote-helpers'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { direction } = (await req.json()) as { direction?: VoteDirection }
    if (direction !== 'up' && direction !== 'down') {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
    }

    const { id, commentId } = await params
    const voteRef = db.ref(`commentVotes/${id}/${commentId}/${decoded.uid}`)
    const scoreRef = db.ref(`comments/${id}/${commentId}/upvoteCount`)

    const snap = await voteRef.get()
    const current = readVote(snap.val())
    const target = fromUserVote(direction)
    const delta = voteDelta(current, target)

    if (delta === -target) {
      await voteRef.remove()
    } else {
      await voteRef.set(target)
    }
    const scoreSnap = await scoreRef.transaction((c: number | null) => (c ?? 0) + delta)
    const score = (scoreSnap.snapshot.val() as number) ?? 0

    return NextResponse.json({
      vote: delta === -target ? null : direction,
      score,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
