import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { fromUserVote, readVote, toUserVote, voteDelta, type VoteDirection } from '@/lib/vote-helpers'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ vote: null })

    const { id } = await params
    const snap = await db.ref(`votes/${id}/${decoded.uid}`).get()
    return NextResponse.json({ vote: toUserVote(readVote(snap.val())) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { direction } = (await req.json()) as { direction?: VoteDirection }
    if (direction !== 'up' && direction !== 'down') {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
    }

    const { id } = await params
    const voteRef = db.ref(`votes/${id}/${decoded.uid}`)
    const scoreRef = db.ref(`discussions/${id}/upvoteCount`)

    const snap = await voteRef.get()
    const current = readVote(snap.val())
    const target = fromUserVote(direction)
    const delta = voteDelta(current, target)

    if (delta === -target) {
      await voteRef.remove()
      await db.ref(`userVotes/${decoded.uid}/${id}`).remove()
    } else {
      await voteRef.set(target)
      await db.ref(`userVotes/${decoded.uid}/${id}`).set({ vote: target, votedAt: Date.now() })
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
