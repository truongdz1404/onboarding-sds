import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const voteRef = db.ref(`votes/${id}/${decoded.uid}`)
    const countRef = db.ref(`discussions/${id}/upvoteCount`)

    const voteSnapshot = await voteRef.get()
    if (voteSnapshot.exists()) {
      await voteRef.remove()
      await countRef.transaction((count: number | null) => Math.max(0, (count ?? 0) - 1))
      return NextResponse.json({ voted: false })
    } else {
      await voteRef.set({ createdAt: Date.now() })
      await countRef.transaction((count: number | null) => (count ?? 0) + 1)
      return NextResponse.json({ voted: true })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
