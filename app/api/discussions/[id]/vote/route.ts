import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const voteRef = db.collection('votes').doc(`${id}_${decoded.uid}`)
    const postRef = db.collection('discussions').doc(id)

    const voteDoc = await voteRef.get()
    if (voteDoc.exists) {
      await voteRef.delete()
      await postRef.update({ upvoteCount: FieldValue.increment(-1) })
      return NextResponse.json({ voted: false })
    } else {
      await voteRef.set({ postId: id, voterId: decoded.uid, createdAt: new Date() })
      await postRef.update({ upvoteCount: FieldValue.increment(1) })
      return NextResponse.json({ voted: true })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
